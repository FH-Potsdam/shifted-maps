import { Map, List } from 'immutable';
import d3 from 'd3';
import { createSelector } from 'reselect';
import Edge from '../models/edge';
import connectionsSelector from './connections';
import nodesSelector from './nodes';
import { edgeStrokeWidthRangeScaleSelector } from './scales';
import { visScaleSelector, visBoundsSelector } from './vis';

function edgeStrokeWidthRange(edgeStrokeWidthRangeScale, visScale) {
  if (edgeStrokeWidthRangeScale == null || visScale == null)
    return;

  return edgeStrokeWidthRangeScale(visScale);
}

function edgeStrokeWidthDomain(connections) {
  if (connections == null)
    return;

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
  if (edgeStrokeWidthRange == null || edgeStrokeWidthDomain == null)
    return;

  return d3.scale.pow().exponent(.25)
    .range(edgeStrokeWidthRange)
    .domain(edgeStrokeWidthDomain);
}

function edges(connections, nodes, edgeStrokeWidthScale, visBounds) {
  let edges = Map();

  if (connections == null || nodes == null || edgeStrokeWidthScale == null || visBounds == null)
    return edges;

  let min = visBounds.get('min').toObject(),
    max = visBounds.get('max').toObject();

  let bounds = L.bounds([min.x, min.y], [max.x, max.y]);

  return edges.withMutations(function(edges) {
    connections.forEach(function (connection, id) {
      let from = nodes.get(connection.from),
        to = nodes.get(connection.to);

      if (from == null || to == null)
        return;

      let fromPoint = L.point(from.point.x, from.point.y),
        toPoint = L.point(to.point.x, to.point.y);

      let edgeBounds = L.bounds(fromPoint, toPoint);

      edges.set(id, new Edge({
        to: toPoint,
        from: fromPoint,
        connection: id,
        strokeWidth: edgeStrokeWidthScale(connection.trips.size),
        visible: bounds.intersects(edgeBounds)
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