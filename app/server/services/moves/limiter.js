var util = require('util'),
  moment = require('moment'),
  request = require('request');

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;

function Limiter() {
  this._queue = [];
  this._processing = false;
  this._first = true;

  this._hourRemaining = null;
  this._minuteRemaining = null;
  this._now = moment();
}

Limiter.prototype.schedule = function(options, callback) {
  this._queue.push([options, callback]);
  this._processQueue();
};

Limiter.prototype._processQueue = function() {
  // Nothing to work on or already working
  if (this._queue.length === 0 || this._processing)
    return;

  var entry = this._queue.shift();

  this._processing = true;

  var options = entry[0],
    callback = entry[1],
    delay = 0;

  if (!this._first) {
    // Get elapsed hour and minute as a float from 0 to 1
    var elapsed = moment().diff(this._now),
      elapsedHour = HOUR - elapsed % HOUR,
      elapsedMinute = MINUTE - elapsed % MINUTE;

    var delayHour = elapsedHour / this._hourRemaining,
      delayMinute = elapsedMinute / this._minuteRemaining;

    delay = Math.floor(Math.max(delayHour, delayMinute));
  }

  setTimeout(() => {
    var req = request(options);

    req.on('response', response => {
      var headers = response.headers;

      this._hourRemaining = headers['x-ratelimit-hourremaining'];
      this._minuteRemaining = headers['x-ratelimit-minuteremaining'];

      this._first = false;
      this._processing = false;
      this._processQueue();
    });

    callback(req);
  }, delay);
};

module.exports = Limiter;