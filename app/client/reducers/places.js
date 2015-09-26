import { Map } from 'immutable';
import { SET_STORYLINE, ADD_PLACE, ADD_STAY } from '../actions/storyline'

export default function places(state = Map(), action) {
  switch (action.type) {
    case SET_STORYLINE:
      let { places, stays } = action;

      return state.withMutations(function(state) {
        places.forEach(function(place) {
          state.set(place.id, place);
        });

        stays.forEach(function(stay) {
          let place = state.get(stay.at);

          place = place.merge({
              stays: place.stays.push(stay),
              duration: place.duration + stay.duration,
              frequency: place.frequency + 1
            });

          state.set(place.id, place);
        });
      });

    default:
      return state
  }
}