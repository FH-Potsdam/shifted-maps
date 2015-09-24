import d3 from 'd3';
import { createSelector } from 'reselect';
import { positionedPlacesSelector } from './places';
import { connectionStrokeWidthRangeScaleSelector } from './scales';
import { visScaleSelector, visBoundsSelector } from './vis';

function scaleConnections(connections, strokeWidthRangeScale, visScale) {
  console.log('scaleConnections');

  let strokeWidthRange = strokeWidthRangeScale(visScale);

  let minFrequency = Infinity,
    maxFrequency = -Infinity;

  connections.forEach(function(connection) {
    let { frequency } = connection;

    minFrequency = Math.min(minFrequency, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
  });

  let strokeWidthDomain = [minFrequency, maxFrequency];

  let strokeWidthScale = d3.scale.pow().exponent(.25)
    .range(strokeWidthRange)
    .domain(strokeWidthDomain);

  return connections.map(function(connection) {
    return connection.set('strokeWidth', strokeWidthScale(connection.frequency));
  });
}

function positionConnections(connections, places) {
  console.log('positionConnections');

  return connections.map(function(connection) {
    let from = places.get(connection.from),
      to = places.get(connection.to);

    return connection.merge({
      fromPoint: from.point,
      toPoint: to.point
    });
  });
}

function boundConnections(connections, visBounds) {
  console.log('boundConnections');

  return connections.map(function(connection) {
    let { fromPoint, toPoint } = connection;

    let bounds = L.bounds([
      [fromPoint.get('x'), fromPoint.get('y')],
      [toPoint.get('x'), toPoint.get('y')]
    ]);

    return connection.set('visible', visBounds.intersects(bounds));
  });
}

const connectionSelector = state => state.connections;

export const scaledConnectionsSelector = createSelector(
  [
    connectionSelector,
    connectionStrokeWidthRangeScaleSelector,
    visScaleSelector
  ],
  scaleConnections
);

export const positionedConnectionSelector = createSelector(
  [
    scaledConnectionsSelector,
    positionedPlacesSelector
  ],
  positionConnections
);

export const boundedConnectionsSelector = createSelector(
  [
    positionedConnectionSelector,
    visBoundsSelector
  ],
  boundConnections
);

export default connectionSelector;