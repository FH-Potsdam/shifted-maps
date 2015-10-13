var util = require('util'),
  request = require('request'),
  RateLimiter = require('limiter').RateLimiter;

function Limiter(hourLimit, minuteLimit) {
  RateLimiter.call(this, 1, 1000 * 60 / minuteLimit);

  this._hourLimiter = new RateLimiter(1, 1000 * 60 * 60 /hourLimit);
}

util.inherits(Limiter, RateLimiter);

Limiter.prototype .removeTokens = function(number, callback) {
  var limiter = this;

  RateLimiter.prototype.removeTokens.call(this, number, function() {
    limiter._hourLimiter.removeTokens(number, callback);
  });
};

module.exports = Limiter;