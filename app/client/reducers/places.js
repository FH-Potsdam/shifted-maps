import { Map } from 'immutable';
import { RECEIVE_STORYLINE, ADD_PLACE, ADD_STAY } from '../actions'

export default function places(state = Map(), action) {
  let place, stay;

  switch (action.type) {
    case RECEIVE_STORYLINE:
      let { places, stays } = action;

      return state.withMutations(function(state) {
        places.forEach(function(place) {
          state.set(place.id, place);
        });

        stays.forEach(function(stay) {
          place = state.get(stay.at);

          if (place == null) {
            console.error('Missing place: ' + stay.at);
            return state;
          }

          place = place.merge({
            stays: place.stays.push(stay),
            duration: place.duration + stay.duration,
            frequency: place.frequency + 1
          });

          state.set(place.id, place);
        });
      });

    /*case ADD_PLACE:
      place = action.place;

      return state.set(place.id, place);

    case ADD_STAY:
      stay = action.stay;

      place = state.get(stay.at);

      if (place == null) {
        console.error('Missing place: ' + stay.at);
        return state;
      }

      place = place.merge({
        stays: place.stays.push(stay),
        duration: place.duration + stay.duration
      });

      return state.set(place.id, place);*/

    default:
      return state
  }
}