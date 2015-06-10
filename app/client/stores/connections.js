var Reflux = require('reflux'),
  Immutable = require('immutable'),
  debounce = require('mout/function/debounce'),
  init = require('../actions/init'),
  Connection = require('../models/connection');

function uniqueId(idOne, idTwo) {
  return idOne + idTwo * idTwo;
}

var connectionStore = module.exports = Reflux.createStore({
  init: function() {
    this.connections = Immutable.Map();

    this.listenTo(init.addTrip, this.addTrip);
  },

  addTrip: function(trip) {
    var tripId = trip.from < trip.to ?
      uniqueId(trip.from, trip.to) :
      uniqueId(trip.to, trip.from);

    var connection = this.connections.get(tripId);

    if (connection == null)
      connection = new Connection(trip);

    connection = connection.merge({
      trips: connection.get('trips').push(trip),
      duration: connection.duration + trip.duration
    });

    this.connections = this.connections.set(tripId, connection);

    this.trigger(this.connections);
  },

  getInitialState: function() {
    return this.connections;
  }
});

connectionStore.trigger = debounce(connectionStore.trigger, 5);