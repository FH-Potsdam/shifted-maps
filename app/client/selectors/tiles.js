import { Map } from 'immutable';
import { createSelector } from 'reselect';
import { visMapZoomSelector } from './vis';

const tilesSelector = state => state.tiles;

export const tilesLevelSelector = createSelector(
  [
    tilesSelector,
    visMapZoomSelector
  ],
  (tiles, zoom) => tiles.get(zoom, Map())
);

export const tileRequestsSelector = state => state.tiles.get('requests', Map());

export default tilesSelector;