import { createSelector } from 'reselect';
import partial from 'mout/function/partial';
import _ from 'lodash';
import { filteredPlacesSelector } from './places';
import { filteredConnectionsSelector, connectionFrequencyDomainSelector, connectionDistanceDomainSelector, connectionDurationDomainSelector } from './connections';
import { geographicView, frequencyView, durationView } from '../services/views';

function computeBeelineRange(connections) {
  let groupedBeelines = _.chain(connections.toJS())
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

export const geographicViewSelector = createSelector(
  [
    filteredPlacesSelector,
    filteredConnectionsSelector,
    connectionDistanceDomainSelector,
    beelineDomainSelector
  ],
  function(places, connections, connectionDistanceDomain, beelineRange) {
    return partial(geographicView, places, connections, connectionDistanceDomain, beelineRange);
  }
);

export const frequencyViewSelector = createSelector(
  [
    filteredPlacesSelector,
    filteredConnectionsSelector,
    connectionFrequencyDomainSelector,
    beelineDomainSelector
  ],
  function(places, connections, connectionFrequencyDomain, beelineRange) {
    return partial(frequencyView, places, connections, connectionFrequencyDomain, beelineRange);
  }
);

export const durationViewSelector = createSelector(
  [
    filteredPlacesSelector,
    filteredConnectionsSelector,
    connectionDurationDomainSelector,
    beelineDomainSelector
  ],
  function(places, connections, connectionDurationDomain, beelineRange) {
    return partial(durationView, places, connections, connectionDurationDomain, beelineRange);
  }
);