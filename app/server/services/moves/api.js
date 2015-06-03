var util = require('util'),
  url = require('url'),
  request = require('request'),
  oboe = require('oboe'),
  Promise = require('promise'),
  _ = require('lodash'),
  moment = require('moment'),
  https = require('https'),
  config = require('../../config');

function API(accessToken) {
  this._accessToken = accessToken;
}

API.prototype.request = function(url, query) {
  return API.request(url, this._accessToken, query);
};

API.prototype.profile = function() {
  return this.request('/user/profile');
};

API.prototype.daily = function(getURL, date, query) {
  var getURLObject = url.parse(getURL, true);

  getURLObject.pathname += '/daily';

  if (date != null)
    getURLObject.pathname += '/' + date;

  return this.request(url.format(getURLObject), query);
};

API.Processor = function() {
  this._nextHourAt = null;
  this._nextMinuteAt = null;
  this._hourRemaining = null;
  this._minuteRemaining = null;
  this._scheduldedRequests = 0;
};

API.Processor.prototype.schedule = function(req) {
  var processor = this;

  req.pause();
  processor._scheduldedRequests++;

  var delay = processor._delay();

  setTimeout(processor._worker(req), delay);
};

API.Processor.prototype._setRateLimits = function(headers) {
  this._nextHourAt = moment().add(1, 'h');
  this._nextMinuteAt = moment().add(1, 'm');

  this._hourRemaining = headers['x-ratelimit-hourremaining'];
  this._minuteRemaining = headers['x-ratelimit-minuteremaining'];

  console.log(headers);
};

API.Processor.prototype._worker = function(req) {
  var processor = this;

  return function() {
    console.log('Worked');

    req.on('response', function(response) {
      console.log('Response event');
      processor._setRateLimits(response.headers);
    });

    processor._scheduldedRequests--;
    req.resume();
  };
};

API.Processor.prototype._delay = function() {
  if (this._nextHourAt == null || this._nextMinuteAt == null)
    return 0;

  var now = moment(),
    delayInHour = Math.ceil(this._nextHourAt.diff(now) / this._hourRemaining),
    delayInMinute = Math.ceil(this._nextMinuteAt.diff(now) / this._minuteRemaining),
    delay = Math.max(delayInHour, delayInMinute);

  if (delay < 0)
    return 0;

  return delay * this._scheduldedRequests;
};

API.request = function(getURL, accessToken, query) {
  var apiURLObject = url.parse(config.moves.api_url, true),
    getURLObject = url.parse(getURL, true);

  apiURLObject.pathname += getURLObject.pathname;
  _.extend(apiURLObject.query, getURLObject.query, query || {}, {
    access_token: accessToken
  });

  var options = {
    url: url.format(apiURLObject),
    gzip: true
  };

  var req = request(options),
    oboeStream = oboe(req);

  //API.processor.schedule(req);

  return oboeStream;
};

API.DATE_FORMAT = 'YYYYMMDD[T]HHmmssZZ';

API.parseDate = function(date) {
  return moment(date, API.DATE_FORMAT).unix();
};

API.formatDate = function(date) {
  return moment(date).format(API.DATE_FORMAT);
};

API.processor = new API.Processor;

module.exports = API;