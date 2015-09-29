import { createSelector } from 'reselect';
import partial from 'mout/function/partial';
import { mapMapSelector } from './map';
import { filteredPlacesSelector } from './places';
import { filteredConnectionsSelector, connectionFrequencyDomainSelector, connectionDurationDomainSelector } from './connections';
import { geographicView, frequencyView, durationView } from '../services/views';

function computeBeeline(from, to) {
  let fromLat = from.lat + 180,
    toLat = to.lat + 180,
    fromLng = from.lng + 90,
    toLng = to.lng + 90;

  return Math.sqrt(Math.pow(toLng - fromLng, 2) + Math.pow(toLat - fromLat, 2));
}

/*function computeBeeline(from, to) {
  let rad = Math.PI / 180,
    lat1 = from.lat * rad,
    lat2 = to.lat * rad,
    a = Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos((from.lng - to.lng) * rad);

  return Math.acos(Math.min(1, a));
}*/

function computeBeelineRange(connections, places) {
  // @TODO:
  // 1. Mittelwert/Durschnittswert aller Frequenzen, Durations finden
  // 2. Verbindung finden, die diesem Mittel-/Durschnittswert am nächsten ist
  // 3. Entfernung dieser Verbindung ausrechnen
  // 4. Diese Entfernung als Mittelwert für die neue Entfernungsskala verwenden

  let minBeeline = Infinity,
    maxBeeline = -Infinity;

  connections.forEach(function(connection) {
    let from = places.get(connection.from),
      to = places.get(connection.to),
      beeline = computeBeeline(from.location, to.location);

    minBeeline = Math.min(beeline, minBeeline);
    maxBeeline = Math.max(beeline, maxBeeline);
  });

  return [minBeeline, maxBeeline];
}

const beelineDomainSelector = createSelector(
  [
    filteredConnectionsSelector,
    filteredPlacesSelector
  ],
  computeBeelineRange
);

export const geographicViewSelector = createSelector(
  [
    mapMapSelector
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