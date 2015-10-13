var util = require('util'),
  url = require('url'),
  oboe = require('oboe'),
  Promise = require('promise'),
  _ = require('lodash'),
  moment = require('moment'),
  request = require('request');

// @TODO Separate into client and request
function API(accessToken, limiter, options) {
  this._accessToken = accessToken;
  this._limiter = limiter;
  this._options = options;
}

API.prototype.request = function(getURL, query, callback) {
  var apiURLObject = url.parse(this._options.api_url, true),
    getURLObject = url.parse(getURL, true);

  apiURLObject.pathname += getURLObject.pathname;
  _.extend(apiURLObject.query, getURLObject.query, query || {}, {
    access_token: this._accessToken
  });

  var options = {
    url: url.format(apiURLObject),
    gzip: true
  };

  this._limiter.removeTokens(1, function() {
    var req = request(options);

    req.on('response', function(response) {
      console.log(response.headers);
    });

    callback(oboe(req));
  });
};

API.prototype.profile = function() {
  return this.request('/user/profile');
};

API.prototype.daily = function(getURL, date, query, callback) {
  var getURLObject = url.parse(getURL, true);

  getURLObject.pathname += '/daily';

  if (date != null)
    getURLObject.pathname += '/' + date;

  this.request(url.format(getURLObject), query, callback);
};

API.DATE_FORMAT = 'YYYYMMDD[T]HHmmssZZ';

API.parseDate = function(date) {
  return moment(date, API.DATE_FORMAT).toDate();
};

API.formatDate = function(date) {
  return moment(date).format(API.DATE_FORMAT);
};

module.exports = API;