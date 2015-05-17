var util = require('util'),
  Writable = require('stream').Writable,
  Place = require('../models/place'),
  Connection = require('../models/connection'),
  Visit = require('../models/visit'),
  Trip = require('../models/trip');

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

  if (object instanceof Visit)
    return this._persistVisit(object, callback);

  if (object instanceof Trip)
    return this._persistTrip(object, callback);

  callback('Cannot persist unknown type.');
};

Persister.prototype._persistPlace = function(place, callback) {
  var persister = this;

  Place.findById(place._id)
    .exec()
    .then(function(persistedPlace) {
      if (persistedPlace == null) {
        place._user = persister._user;
        return place.save();
      }
    })
    .onResolve(callback);
};

Persister.prototype._persistConnection = function(connection, callback) {
  var persister = this;

  Connection.findOne({ _from: connection._from, _to: connection._to })
    .exec()
    .then(function(persistedConnection) {
      if (persistedConnection == null) {
        connection._user = persister._user;
        return connection.save();
      }
    })
    .onResolve(callback);
};

Persister.prototype._persistVisit = function(visit, callback) {
  visit._user = this._user;
  visit.save(callback);
};

Persister.prototype._persistTrip = function(trip, callback) {
  trip._user = this._user;
  trip.save(callback);
};

module.exports = Persister;