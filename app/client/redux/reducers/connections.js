import { Map } from 'immutable';
import Connection from '../models/connection';
import { ADD_TRIP } from '../actions';

function uniqueId(idOne, idTwo) {
  return idOne + idTwo * idTwo;
}

export default function connections(state = Map(), action) {
  switch (action.type) {
    case ADD_TRIP:
      let trip = action.trip;

      let tripId = trip.from < trip.to ?
        uniqueId(trip.from, trip.to) :
        uniqueId(trip.to, trip.from);

      let connection = state.get(tripId);

      if (connection == null)
        connection = new Connection({ from: trip.from, to: trip.to });

      connection = connection.merge({
        trips: connection.trips.push(trip),
        duration: connection.duration + trip.duration
      });

      return state.set(tripId, connection);

    default:
      return state;
  }
}