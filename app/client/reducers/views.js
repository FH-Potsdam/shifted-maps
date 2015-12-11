import { Map } from 'immutable';
import { UPDATE_VIEW } from '../actions/views';

function updateView(state, action) {
  let { activeView, mapZoom, nodes } = action,
    level = {};

  nodes.forEach(function(node) {
    level[node.place] = L.point(node.x, node.y);
  });

  return state.setIn([activeView, mapZoom], Map(level));
}

export default function views(state = Map(), action) {
  switch (action.type) {
    case UPDATE_VIEW:
      return updateView(state, action);
  }

  return state;
}