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

  // We do not push places, we already pushed
  if (this._pushedPlaces.indexOf(place.id) > -1)
    return callback();

  this._pushedPlaces.push(place.id);

  function normalize(place) {
    normalizer._pushObject('place', place);

    callback();
  }

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
  this._pushObject('stay', stay);
  callback();
};

Normalizer.prototype._normalizeTrip = function(trip, callback) {
  this._pushObject('trip', trip);
  callback();
};

Normalizer.prototype._normalizeOff = function(stay, callback) {
  this._pushObject('off', null);
  callback();
};

Normalizer.prototype._pushObject = function(name, object) {
  var temp = {};
  temp[name] = object;
  this.push(temp);
};

module.exports = Normalizer;