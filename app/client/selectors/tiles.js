import { Map } from 'immutable';
import { createSelector } from 'reselect';
import { visMapZoomSelector } from './vis';

export const zoomTilesSelector = (state) => state.tiles;

export default createSelector(
  [
    zoomTilesSelector,
    visMapZoomSelector
  ],
  (tiles, zoom) => tiles.get(zoom, Map())
)