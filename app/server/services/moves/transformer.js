var util = require('util'),
  _ = require('lodash'),
  Transform = require('stream').Transform,
  Place = require('../../models/place'),
  Stay = require('../../models/stay'),
  Trip = require('../../models/trip'),
  Off = require('../../models/off');

function Transformer() {
  Transform.call(this, { objectMode: true });

  this._lastTrip = null;
  this._lastPlace = null;
}

util.inherits(Transformer, Transform);

Transformer.prototype._transform = function(object, encoding, callback) {
  if (object.type === 'place')
    return this._transformPlace(object, callback);

  if (object.type === 'move')
    return this._transformMove(object, callback);

  if (object.type === 'off')
    return this._transformOff(object, callback);

  return callback('Invalid object type "' + object.type + '".');
};

Transformer.prototype._transformDate = function(object, callback) {
  callback();
};

Transformer.prototype._transformPlace = function(object, callback) {
  this._lastPlace = new Place({
    id: object.place.id,
    location: object.place.location,
    name: object.place.name,
    placeType: object.place.type
  });

  var stay = new Stay({
    at: object.place.id,
    startAt: object.startTime,
    endAt: object.endTime
  });

  if (this._lastTrip != null) {
    this._lastTrip = this._lastTrip.set('to', this._lastPlace.id);
    this.push(this._lastTrip);
    this._lastTrip = null;
  }

  this.push(this._lastPlace);
  this.push(stay);

  callback();
};

Transformer.prototype._transformMove = function(object, callback) {
  if (this._lastPlace == null)
    return callback();

  this._lastTrip = new Trip({
    from: this._lastPlace.id,
    startAt: object.startTime,
    endAt: object.endTime
  });

  callback();
};

Transformer.prototype._transformOff = function(object, callback) {
  this._lastTrip = null;
  this._lastPlace = null;

  this.push(new Off());

  callback();
};

module.exports = Transformer;