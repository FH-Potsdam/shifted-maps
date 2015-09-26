import { createStructuredSelector } from 'reselect';
import { tiledPlacesSelector } from './selectors/places';
import { boundedConnectionsSelector } from './selectors/connections';
import visSelector from './selectors/vis';
import mapSelector from './selectors/map';

export const vis = createStructuredSelector({
  vis: visSelector,
  nodes: tiledPlacesSelector,
  edges: boundedConnectionsSelector
});

export const app = createStructuredSelector({
  map: mapSelector
});