var util = require('util'),
  url = require('url'),
  request = require('request'),
  oboe = require('oboe'),
  Promise = require('promise'),
  _ = require('lodash'),
  moment = require('moment'),
  config = require('../../config');

function API(processor, accessToken) {
  this._processor = processor;
  this._accessToken = accessToken;
}

API.request = function(getURL, accessToken, query) {
  var apiURLObject = url.parse(config.moves.api_url, true),
    getURLObject = url.parse(getURL, true);

  apiURLObject.pathname += getURLObject.pathname;
  _.extend(apiURLObject.query, getURLObject.query, query || {}, {
    access_token: accessToken
  });

  var options = {
    url: apiURLObject,
    gzip: true
  };

  return request(options);
};

API.DATE_FORMAT = 'YYYYMMDD[T]HHmmssZZ';

API.parseDate = function(date) {
  return moment(date, API.DATE_FORMAT).valueOf();
};

API.formatDate = function(date) {
  return moment(date).format(API.DATE_FORMAT);
};

API.prototype._request = function(url, query) {
  return API.request(url, this._accessToken, query);
};

API.prototype.request = function(url, query, callback) {
  var api = this,
    request = this._request(url, query),
    task = api._processor.schedule(request);

  if (callback != null)
    task.nodeify(callback);

  return task;
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
  this._lastRequestAt = null;
  this._hourLimit = null;
  this._hourRemaining = null;
  this._minuteLimit = null;
  this._minuteRemaining = null;
  this._scheduldedRequests = 0;
};

API.Processor.prototype.schedule = function(request) {
  var processor = this;

  this._scheduldedRequests++;

  var promise = new Promise(function(resolve) {
    setTimeout(processor._worker(request, resolve), processor._delay());
  });

  promise.nodeify(function() {
    processor._scheduldedRequests--;
  });

  return promise;
};

API.Processor.prototype._setRateLimits = function(header) {
  this._lastRequestAt = moment();
  this._hourLimit = header['x-ratelimit-hourlimit'];
  this._hourRemaining = header['x-ratelimit-hourremaining'];
  this._minuteLimit = header['x-ratelimit-minutelimit'];
  this._minuteRemaining = header['x-ratelimit-minuteremaining'];
};

API.Processor.prototype._worker = function(request, resolve) {
  var processor = this;

  return function() {
    var request = oboe(request);

    request.start(function(status, header) {
      processor._setRateLimits(header);
    });

    resolve(request);
  };
};

API.Processor.prototype._delay = function() {
  if (this._lastRequestAt == null)
    return 0;


};

module.exports = API;