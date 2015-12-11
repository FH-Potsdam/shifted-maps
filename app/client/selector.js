import { createStructuredSelector } from 'reselect';
import { hoveredPlacesSelector } from './selectors/places';
import { labeledConnectionsSelector } from './selectors/connections';
//mport { boundedConnectionsSelector } from './selectors/connections';
import { activeViewPointsSelector } from './selectors/views';
import visSelector from './selectors/vis';
import mapSelector from './selectors/map';
import uiSelector from './selectors/ui';
import statsSelector from './selectors/stats';

export const vis = createStructuredSelector({
  vis: visSelector,
  nodes: hoveredPlacesSelector,
  edges: labeledConnectionsSelector, //boundedConnectionsSelector
  points: activeViewPointsSelector
});

export const app = createStructuredSelector({
  map: mapSelector,
  ui: uiSelector,
  stats: statsSelector
});