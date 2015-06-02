var util = require('util'),
  url = require('url'),
  request = require('request'),
  oboe = require('oboe'),
  _ = require('lodash'),
  moment = require('moment'),
  config = require('../../config');

function API(accessToken) {
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
    url: url.format(apiURLObject),
    gzip: true
  };

  return oboe(options);
};

API.DATE_FORMAT = 'YYYYMMDD[T]HHmmssZZ';

API.parseDate = function(date) {
  return moment(date, API.DATE_FORMAT).valueOf();
};

API.formatDate = function(date) {
  return moment(date).format(API.DATE_FORMAT);
};

API.prototype.request = function(url, query) {
  this._request = API.request(url, this._accessToken, query);

  return this;
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

API.prototype.node = function(nodes, callback) {
  this._request.node(nodes, callback);

  return this;
};

API.prototype.start = function(callback) {
  this._request.start(callback);

  return this;
};

API.prototype.done = function(callback) {
  this._request.done(callback);

  return this;
};

API.prototype.fail = function(callback) {
  this._request.fail(callback);

  return this;
};

API.prototype.header = function(name) {
  return this._request.header(name);
};

module.exports = API;