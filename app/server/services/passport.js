var passport = require('passport'),
  config = require('../config'),
  User = require('../models/user'),
  MovesStrategy = require('./moves/strategy'),
  MovesAPI = require('./moves/api');

var strategy = new MovesStrategy(
  {
    scope: ['activity', 'location'],
    clientID: config.moves.client_id,
    clientSecret: config.moves.client_secret,
    callbackURL: config.moves.callback_url,
  },
  function(accessToken, refreshToken, profile, done) {
    User.findById(profile.userId).exec(function(error, user) {
      if (error) return done(error);

      if (user == null) {
        var firstDate = MovesAPI.parseDate(profile.firstDate);

        user = new User({
          _id: profile.userId,
          accessToken: accessToken,
          refreshToken: refreshToken,
          firstDate: firstDate,
          lastUpdateAt: firstDate,
        });

        return user.save(done);
      }

      done(null, user);
    });
  }
);

passport.use(strategy);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id)
    .select('+accessToken')
    .exec(function(error, user) {
      if (error || user == null) return done(error, user);

      strategy.validate(user.accessToken, function(error, valid) {
        if (error) return done(error);

        if (!valid) {
          return user.remove(function() {
            done(null, null);
          });
        }

        user.lastVisitAt = Date.now();
        user.save(done);
      });
    });
});

module.exports = passport;
