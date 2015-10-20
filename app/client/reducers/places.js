import { Map, Set } from 'immutable';
import { SET_STORYLINE, ADD_PLACE, ADD_STAY } from '../actions/storyline';

export default function places(state = Map(), action) {
  switch (action.type) {
    case SET_STORYLINE:
      let { places, stays } = action;

      return state.withMutations(function(state) {
        places.forEach(function(place) {
          state.set(place.id, place);
        });

        let keys = Set(state.keys());

        stays.forEach(function(stay) {
          let place = state.get(stay.at);

          keys = keys.delete(stay.at);

          state.setIn([stay.at, 'stays'], place.stays.push(stay));
        });

        if (keys.size > 0)
          console.error('There are ' + keys.size + ' places without any stays.');
      });

      return state;

    default:
      return state
  }
}