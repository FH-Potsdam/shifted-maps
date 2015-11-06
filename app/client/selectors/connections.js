import d3 from 'd3';
import _ from 'lodash';
import point from 'turf-point';
import distance from 'turf-distance';
import { Seq } from 'immutable';
import { createSelector } from 'reselect';
import placesSelector, { filteredPlacesSelector, positionedPlacesSelector } from './places';
import { connectionStrokeWidthRangeScaleSelector } from './scales';
import { visBoundsSelector, visScaleSelector } from './vis';
import { uiTimeSpanSelector, uiActiveViewSelector } from './ui';
import { CONNECTION_LABEL_SERVICES } from '../models/views';

function computeBeeline(from, to) {
  from = point([from.lng, from.lat]);
  to = point([to.lng, to.lat]);

  return distance(from, to, 'degrees');
}

function beelineConnections(connections, places) {
  return connections.map(function(connection) {
    let from = places.get(connection.from),
      to = places.get(connection.to);

    let beeline = computeBeeline(from.location, to.location);

    return connection.set('beeline', beeline);
  });
}

function filterConnections(connections, places, uiTimeSpan) {
  if (connections.size === 0)
    return connections;

  let [ start, end ] = uiTimeSpan;

  return Seq(connections)
    .map(function(connection) {
      if (!places.get(connection.from).visible || !places.get(connection.to).visible)
        return connection;

      let trips = connection.trips.filter(function(trip) {
        return trip.startAt >= start && trip.endAt <= end;
      });

      let duration = trips.reduce((duration, trip) => duration + trip.duration, 0) / trips.size,
        distance = trips.reduce((distance, trip) => distance + trip.distance, 0) / trips.size;

      duration = Math.round(duration);
      distance = Math.round(distance);

      return connection.merge({
        trips: trips,
        duration: duration,
        distance: distance,
        frequency: trips.size,
        visible: duration > 0
      });
    })
    .toMap();
}

function computeConnectionDomains(connections) {
  let minFrequency = Infinity,
    maxFrequency = -Infinity,
    minDuration = Infinity,
    maxDuration = -Infinity,
    minDistance = Infinity,
    maxDistance = -Infinity;

  connections.forEach(function(connection) {
    let { frequency, duration, distance, visible } = connection;

    if (!visible)
      return;

    minFrequency = Math.min(minFrequency, frequency);
    maxFrequency = Math.max(maxFrequency, frequency);
    minDuration = Math.min(minDuration, duration);
    maxDuration = Math.max(maxDuration, duration);
    minDistance = Math.min(minDistance, distance);
    maxDistance = Math.max(maxDistance, distance);
  });

  let frequencyDomain = [minFrequency, maxFrequency],
    durationDomain = [minDuration, maxDuration],
    distanceDomain = [minDistance, maxDistance];

  return { frequencyDomain, durationDomain, distanceDomain };
}

function computeConnectionStrokeWidthScale(strokeWidthRangeScale, frequencyDomain, visScale) {
  let strokeWidthRange = strokeWidthRangeScale(visScale);

  let strokeWidthScale = d3.scale.pow().exponent(.25)
    .range(strokeWidthRange)
    .domain(frequencyDomain);

  return strokeWidthScale;
}

function scaleConnections(connections, strokeWidthScale) {
  let rankScale = strokeWidthScale.copy()
    .exponent(.1)
    .range([1, 10]);

  return connections.map(function(connection) {
    let { frequency, visible } = connection;

    if (!visible)
      return connection;

    return connection.merge({
      strokeWidth: strokeWidthScale(frequency),
      rank: Math.round(rankScale(frequency))
    });
  });
}

function labelConnection(connections, uiActiveView) {
  if (uiActiveView == null)
    return connections;

  return connections.map(function(connection) {
    if (!connection.visible)
      return connection;

    return connection.set('label', CONNECTION_LABEL_SERVICES[uiActiveView](connection));
  });
}

function positionConnections(connections, places) {
  return connections.map(function(connection) {
    if (!connection.visible)
      return connection;

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
    let { fromPoint, toPoint, visible } = connection;

    if (!visible)
      return connection;

    let bounds = L.bounds([
      [fromPoint.get('x'), fromPoint.get('y')],
      [toPoint.get('x'), toPoint.get('y')]
    ]);

    return connection.set('visible', visBounds.intersects(bounds));
  });
}

const connectionsSelector = state => state.connections;

export const beelinedConnectionsSelector = createSelector(
  [
    connectionsSelector,
    placesSelector
  ],
  beelineConnections
);

export const filteredConnectionsSelector = createSelector(
  [
    beelinedConnectionsSelector, //connectionsSelector,
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

export const connectionDistanceDomainSelector = createSelector(
  [
    connectionDomainSelector
  ],
  domains => domains.distanceDomain
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

export const labeledConnectionsSelector = createSelector(
  [
    scaledConnectionsSelector,
    uiActiveViewSelector
  ],
  labelConnection
);

export const positionedConnectionSelector = createSelector(
  [
    labeledConnectionsSelector,
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