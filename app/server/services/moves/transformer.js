var util = require('util'),
  Transform = require('stream').Transform,
  Place = require('../../models/place'),
  Connection = require('../../models/connection');

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
    return this._transformOff(object, callback);

  return callback('Invalid object type "' + object.type + '".');
};

Transformer.prototype._transformDate = function(object, callback) {
  this._currentDate = object;
  callback();
};

Transformer.prototype._transformPlace = function(object, callback) {
  if (this._lastPlace == null) {
    this._lastPlace = new Place({
      _id: object.place.id,
      visits: [{ startAt: object.startTime }],
      location: object.place.location,
      name: object.place.name,
      type: object.place.type
    });
  }

  this._lastPlace.visits[0].endAt = object.endTime;

  if (this._lastConnection != null) {
    this._lastConnection._to = this._lastPlace._id;
    this._pushLastConnection();
  }

  callback();
};

Transformer.prototype._transformMove = function(object, callback) {
  if (this._lastPlace == null) {
    return callback();
  }

  if (this._lastConnection == null) {
    this._lastConnection = new Connection({
      _from: this._lastPlace._id,
      trips: [{ startAt: object.startTime, activities: [] }]
    });

    this._pushLastPlace();
  }

  var trip = this._lastConnection.trips[0];

  trip.endAt = object.endTime;

  object.activities.forEach(function(activity) {
    trip.activities.push({
      type: activity.activity,
      group: activity.group,
      duration: activity.duration,
      distance: activity.distance,
      steps: activity.steps
    });
  });

  callback();
};

Transformer.prototype._transformOff = function(object, callback) {
  this._pushLastPlace();
  this._lastConnection = null;
  callback();
};

Transformer.prototype._pushNotNull = function(object) {
  if (object != null)
    this.push(object);
};

Transformer.prototype._pushLastPlace = function() {
  this._pushNotNull(this._lastPlace);
  this._lastPlace = null;
};

Transformer.prototype._pushLastConnection = function() {
  this._pushNotNull(this._lastConnection);
  this._lastConnection = null;
};

module.exports = Transformer;