import { createSelector } from 'reselect';
import partial from 'mout/function/partial';
import _ from 'lodash';
import { scaledPlacesSelector } from './places';
import { filteredConnectionsSelector, connectionFrequencyDomainSelector, connectionDistanceDomainSelector, connectionDurationDomainSelector } from './connections';
import { geographicView, frequencyView, durationView } from '../services/views';

function computeBeelineRange(connections) {
  let minBeeline = Infinity,
    maxBeeline = -Infinity

  connections.forEach(function(connection) {
    let { beeline, visible } = connection;

    if (!visible)
      return;

    minBeeline = Math.min(minBeeline, beeline);
    maxBeeline = Math.max(maxBeeline, beeline);
  });

  return [ minBeeline, maxBeeline ];
}

function computeNormalizedBeelineRange(connections) {
  let groupedBeelines = _.chain(connections.toJS())
    .filter(function(connection) {
      return connection.visible;
    })
    .groupBy(function(connection) {
      return Math.round(connection.beeline * 100) / 100;
    })
    .groupBy('length')
    .mapValues(function(connections) {
      return _.flatten(connections);
    })
    .value();

  let groupedBeelineMeans = _.map(groupedBeelines, function(connections) {
    return _.sum(connections, 'beeline') / connections.length;
  });

  return [_.min(groupedBeelineMeans), _.max(groupedBeelineMeans)];

  /*let minBeeline = Infinity,
    maxBeeline = -Infinity;

  connections.forEach(function(connection) {
    let { beeline } = connection;

    minBeeline = Math.min(beeline, minBeeline);
    maxBeeline = Math.max(beeline, maxBeeline);
  });

  console.log([minBeeline, maxBeeline]);

  return [minBeeline, maxBeeline];*/
}

const beelineDomainSelector = createSelector(
  [
    filteredConnectionsSelector
  ],
  computeBeelineRange
);

const normalizedBeelineDomainSelector = createSelector(
  [
    filteredConnectionsSelector
  ],
  computeNormalizedBeelineRange
);

export const geographicViewSelector = createSelector(
  [
    scaledPlacesSelector,
    filteredConnectionsSelector,
    connectionDistanceDomainSelector,
    beelineDomainSelector
  ],
  function(places, connections, connectionDistanceDomain, beelineRange) {
    places = places.filter(place => place.visible);
    connections = connections.filter(connection => connection.visible);

    return partial(geographicView, places, connections, connectionDistanceDomain, beelineRange);
  }
);

export const frequencyViewSelector = createSelector(
  [
    scaledPlacesSelector,
    filteredConnectionsSelector,
    connectionFrequencyDomainSelector,
    normalizedBeelineDomainSelector
  ],
  function(places, connections, connectionFrequencyDomain, beelineRange) {
    places = places.filter(place => place.visible);
    connections = connections.filter(connection => connection.visible);

    return partial(frequencyView, places, connections, connectionFrequencyDomain, beelineRange);
  }
);

export const durationViewSelector = createSelector(
  [
    scaledPlacesSelector,
    filteredConnectionsSelector,
    connectionDurationDomainSelector,
    beelineDomainSelector
  ],
  function(places, connections, connectionDurationDomain, beelineRange) {
    places = places.filter(place => place.visible);
    connections = connections.filter(connection => connection.visible);

    return partial(durationView, places, connections, connectionDurationDomain, beelineRange);
  }
);