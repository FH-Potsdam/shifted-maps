import { Map } from 'immutable';
import Connection from '../models/connection';
import { ADD_TRIP } from '../actions/storyline';

function uniqueId(idOne, idTwo) {
  return idOne + idTwo * idTwo;
}

function addTrip(state, action) {
  let { trip } = action;

  let tripId = trip.from < trip.to ?
    uniqueId(trip.from, trip.to) :
    uniqueId(trip.to, trip.from);

  let connection = state.get(tripId);

  if (connection == null)
    connection = new Connection({ id: tripId, from: trip.from, to: trip.to });

  return state.set(tripId, connection.set('trips', connection.trips.push(trip)));
}

export default function connections(state = Map(), action) {
  switch (action.type) {
    case ADD_TRIP:
      return addTrip(state, action);

    default:
      return state;
  }
}