import { createSelector } from 'reselect';

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

export default mapSelector;