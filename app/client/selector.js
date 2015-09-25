import { createStructuredSelector } from 'reselect';
import { tiledPlacesSelector } from './selectors/places';
import { boundedConnectionsSelector } from './selectors/connections';
import visSelector from './selectors/vis';

export default createStructuredSelector({
  vis: visSelector,
  nodes: tiledPlacesSelector,
  edges: boundedConnectionsSelector
});