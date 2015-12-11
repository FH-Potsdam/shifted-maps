import { createSelector } from 'reselect';
import placesSelector from './places';

const mapSelector = state => state.map;

export const mapZoomSelector = createSelector(
  [
    mapSelector
  ],
  map => map.get('zoom')
);

export const mapMapSelector = createSelector(
  [
    mapSelector
  ],
  map => map.get('map')
);

export const mapPointsSelector = createSelector(
  [
    mapMapSelector,
    placesSelector
  ],
  function(map, places) {
    return places.map(function(place) {
      return map.latLngToLayerPoint(place.location);
    });
  }
);

export default mapSelector;