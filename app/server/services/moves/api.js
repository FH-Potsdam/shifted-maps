var util = require('util'),
  url = require('url'),
  oboe = require('oboe'),
  extend = require('lodash/object/extend'),
  moment = require('moment');

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
  extend(apiURLObject.query, getURLObject.query, query || {}, {
    access_token: this._accessToken
  });

  var options = {
    url: url.format(apiURLObject),
    gzip: true
  };

  this._limiter.schedule(options, function(req) {
    callback(oboe(req));
  });
};

API.prototype.profile = function(callback) {
  this.request('/user/profile', null, callback);
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