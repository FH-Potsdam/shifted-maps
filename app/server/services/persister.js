var util = require('util'),
  Writable = require('stream').Writable,
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
  var user = this._user;

  Place.findById(place._id).exec(function(error, persistedPlace) {
    if (error)
      return callback(error);

    if (persistedPlace == null) {
      persistedPlace = place;
      persistedPlace._user = user;
    } else {
      place.visits.forEach(function(visit) {
        persistedPlace.visits.push(visit);
      });
    }

    persistedPlace.save(callback);
  });
};

Persister.prototype._persistConnection = function(connection, callback) {
  var user = this._user;

  Connection.findOne({ _from: connection._from, _to: connection._to }).exec(function(error, persistedConnection) {
    if (error)
      return callback(error);

    if (persistedConnection == null) {
      persistedConnection = connection;
      persistedConnection._user = user;
    } else {
      connection.trips.forEach(function(trip) {
        persistedConnection.trips.push(trip);
      });
    }

    persistedConnection.save(callback);
  });
};

module.exports = Persister;