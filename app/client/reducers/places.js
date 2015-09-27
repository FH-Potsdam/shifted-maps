import { Map, Set } from 'immutable';
import { SET_STORYLINE, ADD_PLACE, ADD_STAY } from '../actions/storyline';

export default function places(state = Map(), action) {
  switch (action.type) {
    case SET_STORYLINE:
      let { places, stays } = action;

      state = state.withMutations(function(state) {
        places.forEach(function(place) {
          state.set(place.id, place);
        });

        let keys = Set(state.keys());

        stays.forEach(function(stay) {
          let place = state.get(stay.at);

          keys = keys.delete(stay.at);

          place = place.merge({
            stays: place.stays.push(stay),
            duration: place.duration + stay.duration,
            frequency: place.frequency + 1
          });

          state.set(place.id, place);
        });

        console.log(keys.toJS());
      });

      /*state.forEach(function(place) {
        console.log(place.stays.size > 0);
      });*/

      return state;

    default:
      return state
  }
}