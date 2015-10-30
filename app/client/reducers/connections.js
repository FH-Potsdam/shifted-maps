import { Map } from 'immutable';
import Connection from '../models/connection';
import { ADD_TRIPS } from '../actions/storyline';

function uniqueId(idOne, idTwo) {
  return idOne + idTwo * idTwo;
}

function addTrips(state, action) {
  let { trips } = action;

  return state.withMutations(function(state) {
    trips.forEach(function(trip) {
      let tripId = trip.from < trip.to ?
        uniqueId(trip.from, trip.to) :
        uniqueId(trip.to, trip.from);

      let connection = state.get(tripId);

      if (connection == null)
        connection = new Connection({ id: tripId, from: trip.from, to: trip.to });

      state.set(tripId, connection.set('trips', connection.trips.push(trip)));
    });
  });
}

export default function connections(state = Map(), action) {
  switch (action.type) {
    case ADD_TRIPS:
      return addTrips(state, action);

    default:
      return state;
  }
}