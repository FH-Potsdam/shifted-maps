import { Map } from 'immutable';
import Connection from '../models/connection';
import { ADD_TRIPS } from '../actions/storyline';

function addTrips(state, action) {
  let { trips } = action;

  return state.withMutations(function(state) {
    trips.forEach(function(trip) {
      if (trip.from === trip.to)
        return;

      let connectionId = Connection.getId(trip.from, trip.to),
        connection = state.get(connectionId);

      if (connection == null)
        connection = new Connection({ id: connectionId, from: trip.from, to: trip.to });

      state.set(connectionId, connection.set('trips', connection.trips.push(trip)));
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