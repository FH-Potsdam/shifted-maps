import { Map } from 'immutable';
import Connection from '../models/connection';
import { SET_STORYLINE, ADD_TRIP } from '../actions/storyline';

function uniqueId(idOne, idTwo) {
  return idOne + idTwo * idTwo;
}

export default function connections(state = Map(), action) {
  switch (action.type) {
    case SET_STORYLINE:
      let trips = action.trips;

      return state.withMutations(function(state) {
        trips.forEach(function(trip) {
          let tripId = trip.from < trip.to ?
            uniqueId(trip.from, trip.to) :
            uniqueId(trip.to, trip.from);

          let connection = state.get(tripId);

          if (connection == null)
            connection = new Connection({ from: trip.from, to: trip.to });

          connection = connection.merge({
            id: tripId,
            trips: connection.trips.push(trip),
            duration: connection.duration + trip.duration,
            frequency: connection.frequency + 1
          });

          state.set(tripId, connection);
        });
      });

    default:
      return state;
  }
}