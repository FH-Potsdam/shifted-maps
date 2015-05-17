var util = require('util'),
  Writable = require('stream').Writable,
  _ = require('lodash'),
  Place = require('../models/place'),
  Connection = require('../models/connection');

function Persister(user) {
  Writable.call(this, { objectMode: true });

  this._user = user;
}

util.inherits(Persister, Writable);

Persister.prototype._write = function(object, encoding, callback) {
  if (object instanceof Place)
    return this._persistPlace(object, callback);

  if (object instanceof Connection)
    return this._persistConnection(object, callback);

  callback('Cannot persist unknown type.');
};

Persister.prototype._persistPlace = function(place, callback) {
  var persister = this;

  var promise = Place.findById(place._id)
    .exec()
    .then(function(persistedPlace) {
      if (persistedPlace == null) {
        place._user = persister._user;
        persistedPlace = place;
      } else {
        place.visits.forEach(function(visit) {
          persistedPlace.visits.push(visit);
        });
      }

      return persistedPlace.save();
    })
    .onResolve(callback);
};

Persister.prototype._persistConnection = function(connection, callback) {
  var persister = this;

  var promise = Connection.findOne({ _from: connection._from, _to: connection._to })
    .exec()
    .then(function(persistedConnection) {
      if (persistedConnection != null)
        return persistedConnection;

      // Check for reversed direction
      return Connection.findOne({ _from: connection._to, _to: connection._from })
        .exec()
        .then(function(persistedConnection) {
          // Flip direction if connection already exists in the reversed direction
          if (persistedConnection != null) {
            connection.trips.forEach(function(trip) {
              trip.direction = false;
            });
          }

          return persistedConnection;
        });
    })
    .then(function(persistedConnection) {
      if (persistedConnection == null) {
        connection._user = persister._user;
        persistedConnection = connection;
      } else {
        connection.trips.forEach(function(trip) {
          persistedConnection.trips.push(trip);
        });
      }

      return persistedConnection.save();
    })
    .onResolve(callback);

};

module.exports = Persister;