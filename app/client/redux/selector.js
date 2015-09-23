import { createStructuredSelector } from 'reselect';
import nodesSelector from './selectors/nodes';
import edgesSelector from './selectors/edges';
import visSelector from './selectors/vis';
import scalesSelector from './selectors/scales';

export default createStructuredSelector({
  nodes: nodesSelector,
  edges: edgesSelector,
  vis: visSelector,
  scales: scalesSelector
});