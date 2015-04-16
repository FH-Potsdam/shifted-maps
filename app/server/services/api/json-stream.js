var util = require('util'),
  Transform = require('stream').Transform;

function JSONStream(options) {
  options = options || {};
  options.objectMode = true;

  Transform.call(this, options);

  this._firstPush = true;
}

util.inherits(JSONStream, Transform);

JSONStream.prototype._transform = function(object, encoding, callback) {
  var chunk = ',';

  if (this._firstPush) {
    this._firstPush = false;
    chunk = '[';
  }

  this.push(chunk + JSON.stringify(object));
  callback();
};

JSONStream.prototype._flush = function(callback) {
  var chunk = ']';

  if (this._firstPush) {
    chunk = '[' + chunk;
  }

  this.push(chunk);
  callback();
};

module.exports = JSONStream;