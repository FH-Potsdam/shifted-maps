var Transform = require('stream').Transform,
  util = require('util'),
  geocode = require('../geocode'),
  moment = require('moment'),
  geolib = require('geolib'),
  Place = require('../../models/place'),
  Stay = require('../../models/stay'),
  Trip = require('../../models/trip'),
  Off = require('../../models/off');

function Normalizer() {
  Transform.call(this, { objectMode: true });

  this._pushedPlaces = [];
  this._lastStay = null;
  this._lastPlace = null;
}

util.inherits(Normalizer, Transform);

Normalizer.prototype._transform = function(object, encoding, callback) {
  if (object instanceof Place)
    return this._normalizePlace(object, callback);

  if (object instanceof Stay)
    return this._normalizeStay(object, callback);

  if (object instanceof Trip)
    return this._normalizeTrip(object, callback);

  if (object instanceof Off)
    return this._normalizeOff(object, callback);

  return callback('Invalid object type "' + object + '".');
};

Normalizer.prototype._normalizePlace = function(place, callback) {
  var normalizer = this;

  function normalize(place) {
    normalizer._pushObject('place', place);
    normalizer._pushedPlaces.push(place.id);

    callback();
  }

  if (this._pushedPlaces.indexOf(place.id) > -1)
    return callback();

  if (this._lastPlace != null && this._lastPlace.equals(place)) {
    this._pushedPlaces.push(place.id);
    return callback();
  }

  this._lastPlace = place;

  if (place.name != null)
    return normalize(place);

  geocode(place.location, function(error, name) {
    if (error)
      return callback(error);

    place = place.merge({
      name: name,
      placeType: 'geocode'
    });

    normalize(place);
  });
};

Normalizer.prototype._normalizeStay = function(stay, callback) {
  if (this._lastStay != null && this._lastStay.id == stay.id)
    this._lastStay = this._lastStay.set('endAt', stay.endAt);
  else
    this._lastStay = stay;

  // Wait for pushing this stay until we now how many stays need to be merged into one.

  callback();
};

Normalizer.prototype._normalizeTrip = function(trip, callback) {
  this._pushLastStay();
  this._pushObject('trip', trip);
  callback();
};

Normalizer.prototype._normalizeOff = function(stay, callback) {
  this._pushLastStay();
  this._pushObject('off', null);
  callback();
};

Normalizer.prototype._pushLastStay = function() {
  if (this._lastStay == null)
    return;

  this._pushObject('stay', this._lastStay);
  this._lastStay = null;
};

Normalizer.prototype._pushObject = function(name, object) {
  var temp = {};
  temp[name] = object;
  this.push(temp);
};

module.exports = Normalizer;