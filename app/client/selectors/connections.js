import d3 from 'd3';
import _ from 'lodash';
import point from 'turf-point';
import distance from 'turf-distance';
import { Map } from 'immutable';
import { createSelector } from 'reselect';
import reduce from 'lodash/collection/reduce';
import placesSelector, { filteredPlacesSelector, clusteredPlacesSelector, placePointsSelector } from './places';
import { connectionStrokeWidthRangeScaleSelector } from './scales';
import { visBoundsSelector, visScaleSelector } from './vis';
import { uiTimeSpanSelector, uiActiveViewSelector } from './ui';
import { GEOGRAPHIC_VIEW, DURATION_VIEW, FREQUENCY_VIEW, geographicLabel, durationLabel, frequencyLabel } from '../services/views';

function filterConnections(connections, places, uiTimeSpan) {
  if (connections.size === 0)
    return connections;

  let [ start, end ] = uiTimeSpan;

  return connections.map(function(connection) {
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
  });
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

function labelConnection(connections, viewLabelService) {
  if (viewLabelService == null)
    return connections;

  return connections.map(function(connection) {
    if (!connection.visible)
      return connection;

    return connection.set('label', viewLabelService(connection));
  });
}

/*function positionConnections(connections, places) {
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

function beelineConnections(connections) {
  return connections.map(function(connection) {
    if (!connection.visible)
      return connection;

    let { fromPoint, toPoint } = connection,
      from = L.point(fromPoint.get('x'), fromPoint.get('y')),
      to = L.point(toPoint.get('x'), toPoint.get('y'));

    return connection.set('beeline', from.distanceTo(to));
  });
}

function computeBeelineRange(connections) {
  let minBeeline = Infinity,
    maxBeeline = -Infinity;

  connections.forEach(function(connection) {
    let { beeline, visible } = connection;

    if (!visible)
      return;

    minBeeline = Math.min(minBeeline, beeline);
    maxBeeline = Math.max(maxBeeline, beeline);
  });

  return [minBeeline, maxBeeline];
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
}*/

const connectionsSelector = state => state.connections;

export const filteredConnectionsSelector = createSelector(
  [
    connectionsSelector,
    filteredPlacesSelector,
    uiTimeSpanSelector
  ],
  filterConnections
);

export const connectionBeelinesSelector = createSelector(
  [
    placePointsSelector,
    filteredConnectionsSelector
  ],
  function(points, connections) {
    let beelines = {};

    connections.forEach(function(connection, id) {
      let from = points[connection.from],
        to = points[connection.to];

      beelines[id] = from.distanceTo(to);
    });

    return beelines;
  }
);

export const connectionBeelinesRangeSelector = createSelector(
  [
    connectionBeelinesSelector
  ],
  function(beelines) {
    return reduce(beelines, function(range, beeline) {
      if (beeline < range[0]) range[0] = beeline;
      if (beeline > range[1]) range[1] = beeline;

      return range;
    }, [Infinity, -Infinity]);
  }
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

export const CONNECTION_LABEL_SERVICES = {
  [GEOGRAPHIC_VIEW]: geographicLabel,
  [DURATION_VIEW]: durationLabel,
  [FREQUENCY_VIEW]: frequencyLabel
};

export const connectionLabelServiceSelector = createSelector(
  [
    uiActiveViewSelector
  ],
  function(activeView) {
    if (activeView == null)
      return null;

    return CONNECTION_LABEL_SERVICES[activeView];
  }
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
    connectionLabelServiceSelector
  ],
  labelConnection
);

/*export const positionedConnectionSelector = createSelector(
  [
    labeledConnectionsSelector,
    positionedPlacesSelector
  ],
  positionConnections
);

export const beelinedConnectionSelector = createSelector(
  [
    positionedConnectionSelector,
    uiActiveViewSelector
  ],
  beelineConnections
);

export const beelineRangeSelector = createSelector(
  [
    beelinedConnectionSelector
  ],
  computeBeelineRange
);

const geographicScaleSelector = createSelector(
  [
    connectionDistanceDomainSelector,
    beelineRangeSelector
  ],
  function(connectionDistanceDomain, beelineRange) {
    return d3.scale.linear()
      .domain(connectionDistanceDomain)
      .range(beelineRange)
      .clamp(true);
  }
);

const durationScaleSelector = createSelector(
  [
    connectionDurationDomainSelector,
    beelineRangeSelector
  ],
  function(connectionDurationDomain, beelineRange) {
    return d3.scale.linear()
      .domain(connectionDurationDomain)
      .range(beelineRange)
      .clamp(true);
  }
);

const frequencyScaleSelector = createSelector(
  [
    connectionFrequencyDomainSelector,
    beelineRangeSelector
  ],
  function(connectionFrequencyDomain, beelineRange) {
    return d3.scale.linear()
      .domain([...connectionFrequencyDomain].reverse())
      .range(beelineRange)
      .clamp(true);
  }
);

const CONNECTION_BEELINE_SCALE_SELECTOR = {
  [GEOGRAPHIC_VIEW]: geographicScaleSelector,
  [DURATION_VIEW]: durationScaleSelector,
  [FREQUENCY_VIEW]: frequencyScaleSelector
};

export const connectionBeelineScaleSelector = state => {
  let activeView = uiActiveViewSelector(state);

  if (activeView == null)
    return null;

  return CONNECTION_BEELINE_SCALE_SELECTOR[activeView](state);
};

export const viewBeelinedConnectionSelector = createSelector(
  [
    beelinedConnectionSelector,
    connectionBeelineScaleSelector
  ],
  viewBeelineConnections
);

export const boundedConnectionsSelector = createSelector(
  [
    viewBeelinedConnectionSelector,
    visBoundsSelector
  ],
  boundConnections
);*/

export default connectionsSelector;