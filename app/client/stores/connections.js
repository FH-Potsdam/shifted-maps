var Reflux = require('reflux'),
  Immutable = require('immutable'),
  init = require('../actions/init'),
  Connection = require('../models/connection'),
  Place = require('../models/place'),
  placesStore = require('../stores/places');

function uniqueId(idOne, idTwo) {
  return idOne + idTwo * idTwo;
}

module.exports = Reflux.createStore({
  init: function() {
    this.connections = Immutable.Map();
    this.places = null;

    this.listenTo(init.addTrip, this.addTrip);
    this.listenTo(placesStore, this.updatePlaces);
  },

  addTrip: function(trip) {
    var tripId = trip.from < trip.to ?
      uniqueId(trip.from, trip.to) :
      uniqueId(trip.to, trip.from);

    var connection = this.connections.get(tripId),
      from = trip.from, to = trip.to;

    if (connection == null) {
      connection = new Connection(trip);

      if (this.places != null) {
        connection = connection.merge({
          from: this.places.get(from) || from,
          to: this.places.get(to) || to
        });
      }
    }

    var trips = connection.get('trips').push(trip),
      duration = trips.reduce(function(reduction, trip) { return reduction + trip.duration; }, 0);

    connection = connection.merge({
      trips: trips,
      duration: duration
    });

    this.connections = this.connections.set(tripId, connection);

    this.trigger(this.connections);
  },

  updatePlaces: function(places) {
    this.places = places;

    this.connections = this.connections.map(function(connection) {
      var from = connection.from,
        to = connection.to;

      if (from instanceof Place)
        from = from.id;

      if (to instanceof Place)
        to = to.id;

      return connection.merge({
        from: places.get(from) || from,
        to: places.get(to) || to
      });
    });

    this.trigger(this.connections);
  },

  getInitialState: function() {
    return this.connections;
  }
});