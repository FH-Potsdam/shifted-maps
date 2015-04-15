var OAuth2Strategy = require('passport-oauth2'),
  util = require('util'),
  url = require('url'),
  request = require('request'),
  _ = require('lodash'),
  config = require('../config');

function MovesStrategy(options, verify) {
  options = options || {};

  options.authorizationURL = config.moves.authorization_url;
  options.tokenURL = config.moves.token_url;

  OAuth2Strategy.call(this, options, verify);

  this.name = 'moves';
}

util.inherits(MovesStrategy, OAuth2Strategy);

MovesStrategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(config.moves.token_info_url, accessToken, function (error, body) {
    if (error)
      return done(new OAuth2Strategy.InternalOAuthError('failed to fetch user profile', error));

    try {
      var info = JSON.parse(body);

      done(null, {
        userId: info.userId,
        expiresIn: info.expires_in
      });
    } catch(e) {
      done(e);
    }
  });
};

function get(getURL, accessToken, callback) {
  var apiURLObject = url.parse(config.moves.api_url, true),
    getURLObject = url.parse(getURL, true);

  apiURLObject.pathname += getURLObject.pathname;
  _.extend(apiURLObject.query, getURLObject.query, {
    access_token: accessToken
  });

  var options = {
    url: url.format(apiURLObject),
    json: true
  };

  request.get(options, callback);
}

module.exports = {
  Strategy: MovesStrategy,
  get: get
};