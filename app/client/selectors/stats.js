import { createSelector, createStructuredSelector } from 'reselect';
import { filteredPlacesSelector } from './places';
import { filteredConnectionsSelector } from './connections';
import { uiTimeSpanSelector } from './ui';

function computeTotalConnectionDistance(connections) {
  return connections.reduce(function(distance, connection) {
    let { trips, visible } = connection;

    if (!visible)
      return distance;

    return trips.reduce(function(distance, trip) {
      return distance + trip.distance;
    }, distance);
  }, 0);
}

function computeTotalConnectionDuration(connections) {
  return connections.reduce(function(duration, connection) {
    let { trips, visible } = connection;

    if (!visible)
      return duration;

    return trips.reduce(function(duration, trip) {
      return duration + trip.duration;
    }, duration);
  }, 0);
}

function computeTotalConnectionFrequency(connections) {
  return connections.reduce(function(frequency, connection) {
    if (!connection.visible)
      return frequency;

    return frequency + connection.frequency;
  }, 0);
}

function computeTotalPlaceDuration(places) {
  return places.reduce(function(duration, place) {
    if (!place.visible)
      return duration;

    return duration + place.duration;
  }, 0);
}

function computeTotalPlaceFrequency(places) {
  return places.reduce(function(frequency, place) {
    if (!place.visible)
      return frequency;

    return frequency + place.frequency;
  }, 0);
}

export const placeLimitSelector = function() {
  return ENV.place_limit;
};

export const totalConnectionsSelector = createSelector(
  [
    filteredConnectionsSelector
  ],
  connections => connections.filter(connection => connection.visible).size
);

export const totalPlacesSelector = createSelector(
  [
    filteredPlacesSelector
  ],
  places => places.filter(place => place.visible).size
);

export const totalConnectionDistanceSelector = createSelector(
  [
    filteredConnectionsSelector
  ],
  computeTotalConnectionDistance
);

export const totalConnectionDurationSelector = createSelector(
  [
    filteredConnectionsSelector
  ],
  computeTotalConnectionDuration
);

export const totalConnectionFrequencySelector = createSelector(
  [
    filteredConnectionsSelector
  ],
  computeTotalConnectionFrequency
);

export const totalPlaceDurationSelector = createSelector(
  [
    filteredPlacesSelector
  ],
  computeTotalPlaceDuration
);

export const totalPlaceFrequencySelector = createSelector(
  [
    filteredPlacesSelector
  ],
  computeTotalPlaceFrequency
);

export const averageConnectionDistanceSelector = createSelector(
  [
    totalConnectionsSelector,
    totalConnectionDistanceSelector
  ],
  (totalConnections, totalConnectionDistance) => totalConnectionDistance / totalConnections
);

export const averageConnectionDurationSelector = createSelector(
  [
    totalConnectionsSelector,
    totalConnectionDurationSelector
  ],
  (totalConnections, totalConnectionDuration) => totalConnectionDuration / totalConnections
);

export const averageConnectionFrequencySelector = createSelector(
  [
    totalConnectionsSelector,
    totalConnectionFrequencySelector
  ],
  (totalConnections, totalConnectionFrequency) => totalConnectionFrequency / totalConnections
);

export const averagePlaceDurationSelector = createSelector(
  [
    totalPlacesSelector,
    totalPlaceDurationSelector
  ],
  (totalPlaces, totalPlaceDuration) => totalPlaceDuration / totalPlaces
);

export const averagePlaceFrequencySelector = createSelector(
  [
    totalPlacesSelector,
    totalPlaceFrequencySelector
  ],
  (totalPlaces, totalPlaceFrequency) => totalPlaceFrequency / totalPlaces
);

export default createStructuredSelector({
  placeLimit: placeLimitSelector,
  timeSpan: uiTimeSpanSelector,
  totalConnections: totalConnectionsSelector,
  totalPlaces: totalPlacesSelector,
  totalConnectionDistance: totalConnectionDistanceSelector,
  totalConnectionDuration: totalConnectionDurationSelector,
  totalConnectionFrequency: totalConnectionFrequencySelector,
  totalPlaceDuration: totalPlaceDurationSelector,
  totalPlaceFrequency: totalPlaceFrequencySelector,
  averageConnectionDistance: averageConnectionDistanceSelector,
  averageConnectionDuration: averageConnectionDurationSelector,
  averageConnectionFrequency: averageConnectionFrequencySelector,
  averagePlaceDuration: averagePlaceDurationSelector,
  averagePlaceFrequency: averagePlaceFrequencySelector
});