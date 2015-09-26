import { Map } from 'immutable';
import { createSelector } from 'reselect';
import { mapZoomSelector } from './map';

const tilesSelector = state => state.tiles;

export const tilesLevelSelector = createSelector(
  [
    tilesSelector,
    mapZoomSelector
  ],
  (tiles, zoom) => tiles.get(zoom, Map())
);

export const tileRequestsSelector = state => state.tiles.get('requests', Map());

export default tilesSelector;