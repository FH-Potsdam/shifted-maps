import { Map } from 'immutable';
import { RECEIVE_TILE } from '../actions';

export default function tiles(state = Map(), action) {
  switch (action.type) {
    case RECEIVE_TILE:
      let { node, tile, zoom } = action;

      return state.setIn([zoom, node.id], Map(tile));

    default:
      return state
  }
}