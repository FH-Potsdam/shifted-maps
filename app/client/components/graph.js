import React, { Component } from 'react';
import d3 from 'd3';
import ReactDom from 'react-dom';
import find from 'lodash/collection/find';
import ConnectionList from './connection-list';
import PlaceList from './place-list';

class Graph extends Component {
  constructor(props) {
    super(props);

    this.forceRunning = false;

    this.force = d3.layout.force()
      .linkDistance(link => link.beeline)
      .gravity(0)
      .on('tick', this.onTick.bind(this))
      .on('end', this.onEnd.bind(this));
  }

  shouldComponentUpdate(nextProps) {
    let { activeView, nodes, edges, points } = this.props;

    return activeView !== nextProps.activeView || nodes !== nextProps.nodes || edges !== nextProps.edges ||
      points !== nextProps.points;
  }

  componentDidMount() {
    this.transformElements();
  }

  componentDidUpdate() {
    if (this.props.activeView != null)
      this.resume();
    else
      this.stop();

    this.transformElements();
  }

  resume() {
    if (this.forceRunning)
      return;

    let nodes = this.computeGraphNodes(),
      links = this.computeGraphLinks(nodes);

    this.force
      .nodes(nodes)
      .links(links)
      .start();

    console.log('resume');
    this.forceRunning = true;
  }

  stop() {
    this.force.stop();
  }

  computeGraphNodes() {
    let points = this.props.points.toJS(),
      places = this.places().data();

    return places.map(function(place) {
      let point = points[place.id];

      return {
        place: place.id,
        x: point.x,
        y: point.y
      };
    });
  }

  computeGraphLinks(nodes) {
    let connections = this.connections().data();

    return connections.map(function(connection) {
      return {
        source: find(nodes, { place: connection.from }),
        target: find(nodes, { place: connection.to }),
        beeline: 0
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
    let { activeView, onTick } = this.props,
      nodes = this.force.nodes();

    onTick(activeView, nodes);
  }

  onEnd() {
    this.forceRunning = false;
  }

  transformElements() {
    let points = this.props.points.toJS();

    this.places()
      .attr('transform', function(node) {
        let point = points[node.id];

        return `translate(${point.x}, ${point.y})`;
      });

    this.connections()
      .each(function(edge) {
        let connection = d3.select(this),
          fromPoint = points[edge.from],
          toPoint = points[edge.to];

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
    let { nodes, edges, onHoverPlace } = this.props;

    return (
      <g className="graph" ref={ref => this.root = ref}>
        <ConnectionList edges={edges}/>
        <PlaceList nodes={nodes} onHover={onHoverPlace}/>
      </g>
    )
  }
}

export default Graph;