var util = require('util'),
  Transform = require('stream').Transform,
  Place = require('../../models/place'),
  Connection = require('../../models/connection'),
  Visit = require('../../models/visit'),
  Trip = require('../../models/trip');

function Transformer() {
  Transform.call(this, { objectMode: true });

  this._currentDate = null;
  this._lastPlace = null;
  this._lastConnection = null;
}

util.inherits(Transformer, Transform);

Transformer.prototype._transform = function(object, encoding, callback) {
  if (object instanceof Date)
    return this._transformDate(object, callback);

  if (object.type === 'place')
    return this._transformPlace(object, callback);

  if (object.type === 'move')
    return this._transformMove(object, callback);

  if (object.type === 'off')
    return this._transformOff(callback);

  return callback('Invalid object type "' + object.type + '".');
};

Transformer.prototype._transformDate = function(object, callback) {
  this._currentDate = object;
  callback();
};

Transformer.prototype._transformPlace = function(object, callback) {
  this._lastPlace = new Place({
    _id: object.place.id,
    location: object.place.location,
    name: object.place.name,
    type: object.place.type
  });

  this.push(this._lastPlace);

  var visit = new Visit({
    _place: this._lastPlace,
    startAt: object.startTime,
    endAt: object.endTime
  });

  this.push(visit);

  if (this._lastConnection != null) {
    this._lastConnection._to = this._lastPlace;
    this._pushLastConnection();
  }

  callback();
};

Transformer.prototype._transformMove = function(object, callback) {
  this._lastConnection = new Connection({
    _from: this._lastPlace
  });

  this._lastPlace = null;

  var trip = new Trip({
    _connection: this._lastConnection,
    startAt: object.startTime,
    endAt: object.endTime
  });

  object.activities.forEach(function(activity) {
    trip.activities.push({
      type: activity.activity,
      group: activity.group,
      duration: activity.duration,
      distance: activity.distance,
      steps: activity.steps
    });
  });

  this.push(trip);

  callback();
};

Transformer.prototype._transformOff = function(callback) {
  this._pushLastConnection();

  callback();
};

Transform.prototype._pushLastConnection = function() {
  if (this._lastConnection != null) {
    this.push(this._lastConnection);
    this._lastConnection = null;
  }
};

module.exports = Transformer;