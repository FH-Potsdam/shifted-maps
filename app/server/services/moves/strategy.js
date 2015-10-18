var OAuth2Strategy = require('passport-oauth2'),
  util = require('util'),
  config = require('../../config'),
  MovesAPI = require('./api'),
  request = require('request');

function MovesStrategy(options, verify) {
  options = options || {};

  options.authorizationURL = config.moves.authorization_url;
  options.tokenURL = config.moves.token_url;

  OAuth2Strategy.call(this, options, verify);

  this.name = 'moves';
  this._limiter = new MovesLimiter();
}

util.inherits(MovesStrategy, OAuth2Strategy);

MovesStrategy.prototype.userProfile = function(accessToken, done) {
  var api = new MovesAPI(accessToken, this._limiter, config.moves);

  api.profile()
    .done(function(data) {
      data.profile.userId = data.userId;
      done(null, data.profile);
    })
    .fail(function(error) {
      done(new OAuth2Strategy.InternalOAuthError('Failed to fetch user profile', error));
    });
};

MovesStrategy.prototype.validate = function(accessToken, done) {
  this._oauth2.get(config.moves.token_info_url, accessToken, function(error) {
    if (!error)
      return done(null, true);

    if (error.statusCode !== 404)
      return done(new Error('Moves returned unknown error.'));

    var data = JSON.parse(error.data);

    // User gives no authorization.
    if (data.error === 'invalid_token')
      return done(null, false);

    done(new Error('Invalid moves request ("' + data.error + '").'));
  });
};

module.exports = MovesStrategy;