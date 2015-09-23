import { Map } from 'immutable';
import d3 from 'd3';
import { createSelector } from 'reselect';
import Edge from '../models/edge';
import connectionsSelector from './connections';
import nodesSelector from './nodes';
import { edgeStrokeWidthRangeScaleSelector } from './scales';
import { visScaleSelector, visBoundsSelector } from './vis';

function edgeStrokeWidthRange(edgeStrokeWidthRangeScale, visScale) {
  return edgeStrokeWidthRangeScale(visScale);
}

function edgeStrokeWidthDomain(connections) {
  let minFrequency = Infinity,
    maxFrequency = -Infinity;

  connections.forEach(function(connection) {
    var frequency = connection.trips.size;

    minFrequency = Math.min(minFrequency, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
  });

  return [minFrequency, maxFrequency];
}

function edgeStrokeWidthScale(edgeStrokeWidthRange, edgeStrokeWidthDomain) {
  return d3.scale.pow().exponent(.25)
    .range(edgeStrokeWidthRange)
    .domain(edgeStrokeWidthDomain);
}

function edges(connections, nodes, edgeStrokeWidthScale, visBounds) {
  return Map().withMutations(function (edges) {
    connections.forEach(function (connection, id) {
      let from = nodes.get(connection.from),
        to = nodes.get(connection.to);

      let fromPoint = L.point(from.x, from.y),
        toPoint = L.point(to.x, to.y);

      let edgeBounds = L.bounds(fromPoint, toPoint);

      edges.set(id, new Edge({
        to: connection.to,
        from: connection.from,
        connection: id,
        strokeWidth: edgeStrokeWidthScale(connection.trips.size),
        visible: visBounds.intersect(edgeBounds)
      }));
    });
  });
}

export const edgeStrokeWidthRangeSelector = createSelector(
  edgeStrokeWidthRangeScaleSelector,
  visScaleSelector,
  edgeStrokeWidthRange
);

export const edgeStrokeWidthDomainSelector = createSelector(
  connectionsSelector,
  edgeStrokeWidthDomain
);

export const edgeStrokeWidthScaleSelector = createSelector(
  edgeStrokeWidthRangeSelector,
  edgeStrokeWidthDomainSelector,
  edgeStrokeWidthScale
);

export default createSelector(
  connectionsSelector,
  nodesSelector,
  edgeStrokeWidthScaleSelector,
  visBoundsSelector,
  edges
);