import { createSelector } from 'reselect';
import partial from 'mout/function/partial';
import _ from 'lodash';
import { mapMapSelector } from './map';
import { filteredPlacesSelector } from './places';
import { filteredConnectionsSelector, connectionFrequencyDomainSelector, connectionDurationDomainSelector } from './connections';
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

  console.log([_.min(groupedBeelineMeans), _.max(groupedBeelineMeans)]);

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
    mapMapSelector,
    beelineDomainSelector
  ],
  function(map) {
    return function(done) {
      geographicView(map, done);
    }
  }
);

export const frequencyViewSelector = createSelector(
  [
    mapMapSelector,
    filteredPlacesSelector,
    filteredConnectionsSelector,
    connectionFrequencyDomainSelector,
    beelineDomainSelector
  ],
  function(map, places, connections, connectionFrequencyDomain, beelineRange) {
    return partial(frequencyView, map, places, connections, connectionFrequencyDomain, beelineRange);
  }
);

export const durationViewSelector = createSelector(
  [
    mapMapSelector,
    filteredPlacesSelector,
    filteredConnectionsSelector,
    connectionDurationDomainSelector,
    beelineDomainSelector
  ],
  function(map, places, connections, connectionDurationDomain, beelineRange) {
    return partial(durationView, map, places, connections, connectionDurationDomain, beelineRange);
  }
);