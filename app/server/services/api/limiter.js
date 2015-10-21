var Transform = require('stream').Transform,
  util = require('util'),
  Place = require('../../models/place');

function Limiter(placeLimit) {
  Transform.call(this, { objectMode: true });

  this._placeLimit = placeLimit;
  this._pushedPlaces = 0;
}

util.inherits(Limiter, Transform);

Limiter.prototype._transform = function(object, encoding, callback) {
  if (object instanceof Place) {
    this._pushedPlaces++;

    if (this._pushedPlaces > this._placeLimit)
      return this.push(null);
  }

  callback(null, object);
};

module.exports = Limiter;