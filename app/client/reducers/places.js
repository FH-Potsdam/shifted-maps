import { Map, Set } from 'immutable';
import { ADD_PLACE, ADD_STAY } from '../actions/storyline';

function addPlace(state, action) {
  let { place } = action;

  return state.set(place.id, place);
}

function addStay(state, action) {
  let { stay } = action,
    place = state.get(stay.at);

  if (place == null)
    console.error(`Tried to add a stay to non existing place with the id "${stay.at}"`);

  return state.setIn([stay.at, 'stays'], place.stays.push(stay));
}

export default function places(state = Map(), action) {
  switch (action.type) {
    case ADD_PLACE:
      return addPlace(state, action);

    case ADD_STAY:
      return addStay(state, action);

    default:
      return state;
  }
}