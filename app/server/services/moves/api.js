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

API.prototype.request = function(url, query, callback) {
  return oboe(API.request(url, this._accessToken, query));
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

module.exports = API;