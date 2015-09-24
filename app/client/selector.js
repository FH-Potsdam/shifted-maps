import { createStructuredSelector } from 'reselect';
import { boundedPlacesSelector } from './selectors/places';
import { boundedConnectionsSelector } from './selectors/connections';
import visSelector from './selectors/vis';

export default createStructuredSelector({
  vis: visSelector,
  nodes: boundedPlacesSelector,
  edges: boundedConnectionsSelector
});