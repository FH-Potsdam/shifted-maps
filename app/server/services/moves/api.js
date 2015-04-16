var util = require('util'),
  url = require('url'),
  request = require('request'),
  oboe = require('oboe'),
  _ = require('lodash'),
  moment = require('moment'),
  config = require('../../config');

function Api(accessToken) {
  this._accessToken = accessToken;
}

Api.request = function(getURL, accessToken, options) {
  var apiURLObject = url.parse(config.moves.api_url, true),
    getURLObject = url.parse(getURL, true);

  apiURLObject.pathname += getURLObject.pathname;
  _.extend(apiURLObject.query, getURLObject.query, {
    access_token: accessToken
  });

  options = _.extend(options || {}, {
    url: url.format(apiURLObject)
  });

  return oboe(options);
};

Api.prototype.request = function(url) {
  this._request = Api.request(url, this._accessToken);

  return this;
};

Api.prototype.profile = function() {
  return this.request('/user/profile');
};

Api.prototype.daily = function(getURL, date) {
  var getURLObject = url.parse(getURL, true);

  getURLObject.pathname += '/daily';

  if (date != null)
    getURLObject.pathname += '/' + date;

  return this.request(url.format(getURLObject));
};

Api.prototype.node = function(nodes, callback) {
  this._request.node(nodes, callback);

  return this;
};

Api.prototype.done = function(callback) {
  this._request.done(callback);

  return this;
};

Api.prototype.fail = function(callback) {
  this._request.fail(callback);

  return this;
};

module.exports = Api;