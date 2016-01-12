import d3 from 'd3';
import _ from 'lodash';
import point from 'turf-point';
import distance from 'turf-distance';
import { List, Map } from 'immutable';
import { createSelector } from 'reselect';
import reduce from 'lodash/collection/reduce';
import placesSelector, { placePointsSelector, placeClustersSelector } from './places';
import { connectionStrokeWidthRangeScaleSelector } from './scales';
import { visBoundsSelector, visScaleSelector } from './vis';
import { uiTimeSpanSelector, uiActiveViewSelector } from './ui';
import { GEOGRAPHIC_VIEW, DURATION_VIEW, FREQUENCY_VIEW, geographicLabel, durationLabel, frequencyLabel } from '../services/views';
import Connection from '../models/connection';

function filterConnections(connections, uiTimeSpan) {
  let [ start, end ] = uiTimeSpan;

  return connections.map(function(connection) {
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

function clusterConnections(connections, clusters) {
  return connections.withMutations(function(connections) {
    let mainConnections = [];

    connections.forEach(function(connection, id) {
      if (!connection.visible)
        return;

      let { from, to } = connection,
        fromCluster = clusters.get(from),
        toCluster = clusters.get(to),
        entry;

      if (fromCluster != null && toCluster != null) {
        // Main connection
        return;
      }

      if (fromCluster == null) {
        entry = clusters.findEntry(function(cluster) {
          return cluster.includes(from);
        });

        if (entry != null)
          [from, fromCluster] = entry;
      }

      if (toCluster == null) {
        entry = clusters.findEntry(function(cluster) {
          return cluster.includes(to);
        });

        if (entry != null)
          [to, toCluster] = entry;
      }

      connections.setIn([id, 'visible'], false);

      if (fromCluster == null || toCluster == null) {
        console.error('Invalid connection', from, to);
        return;
      }

      if (fromCluster !== toCluster) {
        let mainConnectionId = Connection.getId(from, to),
          mainConnection = connections.get(mainConnectionId);

        if (mainConnection == null) {
          mainConnection = new Connection({
            id: mainConnectionId,
            from, to,
            duration: List(),
            distance: List(),
            visible: true
          });
        } else {
          mainConnection = mainConnection.merge({
            duration: List([mainConnection.duration]),
            distance: List([mainConnection.distance]),
            visible: true
          });
        }

        mainConnection = mainConnection.merge({
          duration: mainConnection.duration.push(connection.duration),
          distance: mainConnection.distance.push(connection.distance),
          frequency: mainConnection.frequency + connection.frequency
        });

        mainConnections.push(mainConnection);
      }
    });

    mainConnections.forEach(function(connection) {
      connections.set(connection.id, connection.merge({
        duration: connection.duration.reduce((durationSum, duration) => durationSum + duration, 0) / connection.duration.size,
        distance: connection.distance.reduce((distanceSum, distance) => distanceSum + distance, 0) / connection.distance.size
      }));
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

const connectionsSelector = state => state.connections;

export const filteredConnectionsSelector = createSelector(
  [
    connectionsSelector,
    uiTimeSpanSelector
  ],
  filterConnections
);

export const clusteredConnectionsSelector = createSelector(
  [
    filteredConnectionsSelector,
    placeClustersSelector
  ],
  clusterConnections
);

export const connectionBeelinesSelector = createSelector(
  [
    placePointsSelector,
    clusteredConnectionsSelector
  ],
  function(points, connections) {
    let beelines = {};

    connections.forEach(function(connection, id) {
      // Important for having a valid beeline range
      if (!connection.visible)
        return;

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
    let range = reduce(beelines, function(range, beeline) {
      if (beeline < range[0]) range[0] = beeline;
      if (beeline > range[1]) range[1] = beeline;

      return range;
    }, [Infinity, -Infinity]);

    return range;
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
  domains => {
    return domains.frequencyDomain
  }
);

export const connectionDurationDomainSelector = createSelector(
  [
    connectionDomainSelector
  ],
  domains => {
    return domains.durationDomain
  }
);

export const connectionDistanceDomainSelector = createSelector(
  [
    connectionDomainSelector
  ],
  domains => {
    return domains.distanceDomain
  }
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
    clusteredConnectionsSelector,
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

export default connectionsSelector;