import { Map } from 'immutable';
import { ADD_PLACE, ADD_STAY } from '../actions'

export default function places(state = Map(), action) {
  let place, stay;

  switch (action.type) {
    case ADD_PLACE:
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

      return state.set(place.id, place);

    default:
      return state
  }
}