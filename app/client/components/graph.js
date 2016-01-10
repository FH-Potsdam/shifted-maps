import React, { Component } from 'react';
import d3 from 'd3';
import ReactDom from 'react-dom';
import find from 'lodash/collection/find';
import ConnectionList from './connection-list';
import PlaceList from './place-list';

/*

1. Vis component renders Graph component ✓
2. Graph components renders Connection- and PlaceList components ✓
3. Graph component transforms Elements on componentDidMount ✓
4. User activates View <- Interaction ✓
5. Do 1. and 2. ✓
6. Graph component starts d3 force directed layout
7. Do 3.
8. Dispatch updateView action in the Graph component  on d3 force directed layout tick.
9. Update points in active view of the Graph store
10. Pass new store to Vis and Graph component
11. Do 1. and 2.
12. Start again at 8. till d3 force directed layout is finished
13. User zooms Map <- Interaction
(Stop the graph? Controlled by store?)
14. Store current place locations computed from points in active view
15. Zoom the map
16. Compute new points from last locations and store them in store
18. Do 1. and 2.
18. Restart the graph
19. Do 3. till d3 force directed layout is finished

*/

class Graph extends Component {
  componentDidMount() {
    this.transformElements();
  }

  componentDidUpdate() {
    this.transformElements();
  }

  places() {
    return d3.select(this.root).selectAll('.place')
  }

  connections() {
    return d3.select(this.root).selectAll('.connection')
  }

  transformElements() {
    let { points, transition } = this.props,
      places = this.places();

    if (transition)
      places = places.transition()
        .duration(400);

    places
      .attr('transform', function(node) {
        let point = points[node.id];

        return `translate(${point.x}, ${point.y})`;
      });

    this.connections()
      .each(function(edge) {
        let connection = d3.select(this),
          fromPoint = points[edge.from],
          toPoint = points[edge.to],
          line = connection.select('.connection-line'),
          label = connection.select('.connection-label');

        if (transition) {
          line = line.transition()
            .duration(400);
        }

        line
          .attr({
            x1: fromPoint.x,
            y1: fromPoint.y,
            x2: toPoint.x,
            y2: toPoint.y
          });

        if (label.classed('active')) {
          if (transition) {
            label = label.transition()
              .duration(400);
          }

          label
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
        }
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

  static computeNodes(places, points) {
    return places.map(function(place) {
      let point = points[place.id];

      return {
        place: place.id,
        x: point.x,
        y: point.y,
        start: point
      };
    });
  }

  static computeLinks(nodes, connections, beelines) {
    return connections.map(function(connection) {
      return {
        source: find(nodes, { place: connection.from }),
        target: find(nodes, { place: connection.to }),
        beeline: beelines[connection.id]
      };
    });
  }
}

export default Graph;