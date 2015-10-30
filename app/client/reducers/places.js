import { Map, Set } from 'immutable';
import { ADD_PLACES, ADD_STAYS } from '../actions/storyline';

function addPlaces(state, action) {
  let { places } = action;

  return state.withMutations(function(state) {
    places.forEach(function(place) {
      state.set(place.id, place);
    });
  });
}

function addStays(state, action) {
  let { stays } = action;

  return state.withMutations(function(state) {
    stays.forEach(function(stay) {
      let place = state.get(stay.at);

      if (place == null)
        return console.error(`Tried to add a stay to non existing place with the id "${stay.at}"`);

      state.setIn([stay.at, 'stays'], place.stays.push(stay));
    });
  });
}

export default function places(state = Map(), action) {
  switch (action.type) {
    case ADD_PLACES:
      return addPlaces(state, action);

    case ADD_STAYS:
      return addStays(state, action);

    default:
      return state;
  }
}