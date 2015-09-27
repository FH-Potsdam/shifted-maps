import d3 from 'd3';
import { createSelector } from 'reselect';
import { filteredPlacesSelector, positionedPlacesSelector } from './places';
import { connectionStrokeWidthRangeScaleSelector } from './scales';
import { visBoundsSelector, visScaleSelector } from './vis';
import { uiTimeSpanSelector } from './ui';

function computeConnectionStrokeWidthScale(connections, strokeWidthRangeScale, visScale) {
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

  return strokeWidthScale;
}

function filterConnections(connections, places, uiTimeSpan) {
  if (uiTimeSpan == null)
    return connections;

  let [ start, end ] = uiTimeSpan;

  return connections.filter(function(connection) {
    let trips = connection.trips;

    return trips.size > 0 &&
      trips.first().startAt >= start &&
      trips.last().endAt <= end &&
      places.has(connection.from) &&
      places.has(connection.to);
  });
}

function scaleConnections(connections, strokeWidthScale) {
  return connections.map(function(connection) {
    return connection.set('strokeWidth', strokeWidthScale(connection.frequency));
  });
}

function positionConnections(connections, places) {
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
  return connections.map(function(connection) {
    let { fromPoint, toPoint } = connection;

    let bounds = L.bounds([
      [fromPoint.get('x'), fromPoint.get('y')],
      [toPoint.get('x'), toPoint.get('y')]
    ]);

    return connection.set('visible', visBounds.intersects(bounds));
  });
}

const connectionsSelector = state => state.connections;

export const connectionStrokeWidthScaleSelector = createSelector(
  [
    connectionsSelector,
    connectionStrokeWidthRangeScaleSelector,
    visScaleSelector
  ],
  computeConnectionStrokeWidthScale
);

export const filteredConnectionsSelector = createSelector(
  [
    connectionsSelector,
    filteredPlacesSelector,
    uiTimeSpanSelector
  ],
  filterConnections
);

export const scaledConnectionsSelector = createSelector(
  [
    filteredConnectionsSelector,
    connectionStrokeWidthScaleSelector
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

export default connectionsSelector;