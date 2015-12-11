import React, { Component } from 'react';
import d3 from 'd3';
import ReactDom from 'react-dom';
import { is } from 'immutable';
import find from 'lodash/collection/find';

class Graph extends Component {
  constructor(props) {
    super(props);

    this.force = d3.layout.force()
      .linkDistance(link => link.beeline)
      .gravity(0)
      .on('tick', this.onTick.bind(this));
  }

  shouldComponentUpdate(nextProps) {
    let { activeView, nodes, edges } = this.props;

    return activeView !== nextProps.activeView || !is(nodes, nextProps.nodes) || !is(edges, nextProps.edges);
  }

  componentDidMount() {
    this.transformElements();
  }

  componentDidUpdate() {
    if (this.props.activeView != null)
      this.resume();

    this.transformElements();
  }

  resume() {
    let nodes = this.computeGraphNodes(),
      links = this.computeGraphLinks(nodes);

    this.force
      .nodes(nodes)
      .links(links)
      .start();

    // @TODO Call onTick if not done by d3 on resume.
  }

  stop() {
    this.force.stop();
  }

  computeGraphNodes() {
    let places = this.places()
      .data();

    return places.map(function(place) {
      return {
        place: place.id,
        x: place.point.x,
        y: place.point.y
      };
    });
  }

  computeGraphLinks(nodes) {
    let connections = this.connections()
      .data();

    return connections.map(function(connection) {
      return {
        source: find(nodes, { place: connection.from }),
        target: find(nodes, { place: connection.to }),
        beeline: connection.beeline
      };
    });
  }

  places() {
    return d3.select(this.root).selectAll('.place')
  }

  connections() {
    return d3.select(this.root).selectAll('.connection')
  }

  onTick() {
    let links = this.force.links(),
      nodes = this.force.nodes();

    this.places()
      .datum(function(node) {
        node.point = find(nodes, { place: node.id });

        return node;
      });

    this.connections()
      .datum(function(edge, i) {
        let { source, target } = links[i];

        edge.fromPoint = source;
        edge.toPoint = target;

        return edge;
      });

    this.transformElements();
  }

  transformElements() {
    this.places()
      .attr('transform', function(node) {
        return `translate(${node.point.x}, ${node.point.y})`;
      });

    this.connections()
      .each(function(edge) {
        let connection = d3.select(this),
          { fromPoint, toPoint } = edge;

        connection.select('.connection-line')
          .attr({
            x1: fromPoint.x,
            y1: fromPoint.y,
            x2: toPoint.x,
            y2: toPoint.y
          });

        connection.select('.connection-label')
          .attr('transform', function() {
            let from = L.point(fromPoint.x, fromPoint.y),
              to = L.point(toPoint.x, toPoint.y);

            let vector = to.subtract(from),
              center = from.add(vector.divideBy(2));

            let rotate = Math.atan2(vector.y, vector.x) * 180 / Math.PI;

            if (rotate > 90) rotate -= 180;
            else if (rotate < -90) rotate += 180;

            return `translate(${center.x}, ${center.y}) rotate(${rotate})`
          });
      });
  }

  render() {
    return (
      <g className="graph" ref={ref => this.root = ref}>
        {this.props.children}
      </g>
    )
  }
}

export default Graph;