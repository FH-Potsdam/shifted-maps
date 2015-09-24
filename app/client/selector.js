import { createStructuredSelector } from 'reselect';
import nodesSelector from './selectors/nodes';
import edgesSelector from './selectors/edges';
import visSelector from './selectors/vis';

export default createStructuredSelector({
  vis: visSelector,
  nodes: nodesSelector,
  edges: edgesSelector
});