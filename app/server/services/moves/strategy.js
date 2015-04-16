var OAuth2Strategy = require('passport-oauth2'),
  util = require('util'),
  config = require('../../config'),
  Api = require('./api');

function MovesStrategy(options, verify) {
  options = options || {};

  options.authorizationURL = config.moves.authorization_url;
  options.tokenURL = config.moves.token_url;

  OAuth2Strategy.call(this, options, verify);

  this.name = 'moves';
}

util.inherits(MovesStrategy, OAuth2Strategy);

MovesStrategy.prototype.userProfile = function(accessToken, done) {
  var api = new Api(accessToken);

  api.profile()
    .done(function(data) {
      data.profile.userId = data.userId;
      done(null, data.profile);
    })
    .fail(function(error) {
      done(new OAuth2Strategy.InternalOAuthError('failed to fetch user profile', error));
    });
};

module.exports = MovesStrategy;