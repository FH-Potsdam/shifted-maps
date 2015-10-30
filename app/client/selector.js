import { createStructuredSelector } from 'reselect';
import { hoveredPlacesSelector } from './selectors/places';
import { boundedConnectionsSelector } from './selectors/connections';
import visSelector from './selectors/vis';
import mapSelector from './selectors/map';
import uiSelector from './selectors/ui';
import statsSelector from './selectors/stats';

export const vis = createStructuredSelector({
  vis: visSelector,
  nodes: hoveredPlacesSelector,
  edges: boundedConnectionsSelector
});

export const app = createStructuredSelector({
  map: mapSelector,
  ui: uiSelector,
  stats: statsSelector
});