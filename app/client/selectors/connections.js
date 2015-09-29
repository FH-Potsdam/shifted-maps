import d3 from 'd3';
import { Seq } from 'immutable';
import { createSelector } from 'reselect';
import { filteredPlacesSelector, positionedPlacesSelector } from './places';
import { connectionStrokeWidthRangeScaleSelector } from './scales';
import { visBoundsSelector, visScaleSelector } from './vis';
import { uiTimeSpanSelector } from './ui';

function filterConnections(connections, places, uiTimeSpan) {
  if (connections.size === 0)
    return connections;

  let [ start, end ] = uiTimeSpan;

  return Seq(connections)
    .map(function(connection) {
      let trips = connection.trips.filter(function(trip) {
        return trip.startAt >= start &&
          trip.endAt <= end &&
          places.has(connection.from) &&
          places.has(connection.to);
      });

      let duration = trips.reduce((duration, trip) => duration + trip.duration, 0);

      return connection.merge({
        trips: trips,
        duration: duration,
        frequency: trips.size
      });
    })
    .filter(connection => connection.duration > 0)
    .toMap();
}

function computeConnectionDomains(connections) {
  let minFrequency = Infinity,
    maxFrequency = -Infinity,
    minDuration = Infinity,
    maxDuration = -Infinity;

  connections.forEach(function(connection) {
    let { frequency, duration } = connection;

    minFrequency = Math.min(minFrequency, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
    minDuration = Math.min(minDuration, duration);
    maxDuration = Math.max(maxDuration, duration);
  });

  let frequencyDomain = [minFrequency, maxFrequency],
    durationDomain = [minDuration, maxDuration];

  return { frequencyDomain, durationDomain };
}

function computeConnectionStrokeWidthScale(strokeWidthRangeScale, frequencyDomain, visScale) {
  let strokeWidthRange = strokeWidthRangeScale(visScale);

  let strokeWidthScale = d3.scale.pow().exponent(.25)
    .range(strokeWidthRange)
    .domain(frequencyDomain);

  return strokeWidthScale;
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

export const filteredConnectionsSelector = createSelector(
  [
    connectionsSelector,
    filteredPlacesSelector,
    uiTimeSpanSelector
  ],
  filterConnections
);

export const connectionDomainSelector = createSelector(
  [
    filteredConnectionsSelector
  ],
  computeConnectionDomains
);

export const connectionFrequencyDomainSelector = createSelector(
  [
    connectionDomainSelector
  ],
  domains => domains.frequencyDomain
);


export const connectionDurationDomainSelector = createSelector(
  [
    connectionDomainSelector
  ],
  domains => domains.durationDomain
);


export const connectionStrokeWidthScaleSelector = createSelector(
  [
    connectionStrokeWidthRangeScaleSelector,
    connectionFrequencyDomainSelector,
    visScaleSelector
  ],
  computeConnectionStrokeWidthScale
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