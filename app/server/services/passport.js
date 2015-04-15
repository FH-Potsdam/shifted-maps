var passport = require('passport'),
  config = require('../config'),
  User = require('../models/user'),
  MovesStrategy = require('./moves').Strategy;

passport.use(
  new MovesStrategy({
    scope: ['activity', 'location'],
    clientID: config.moves.client_id,
    clientSecret: config.moves.client_secret,
    callbackURL: config.moves.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    User.findById(profile.userId).exec(function(error, user) {
      if (error)
        return done(error);

      if (user == null) {
        user = new User({
          _id: profile.userId,
          accessToken: accessToken,
          refreshToken: refreshToken
        });

        user.expiresIn(profile.expiresIn);
        user.save();
      }

      done(null, user);
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id).exec(function(error, user) {
    done(error, user);
  });
});

module.exports = passport;