var passport = require('passport'),
  moment = require('moment'),
  config = require('../config'),
  User = require('../models/user'),
  MovesStrategy = require('./moves/strategy');

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
          refreshToken: refreshToken,
          firstDate: moment(profile.firstDate, 'YYYYMMDD').toDate()
        });

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
  User.findById(id).select('+accessToken').exec(function(error, user) {
    done(error, user);
  });
});

module.exports = passport;