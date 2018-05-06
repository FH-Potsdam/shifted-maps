var express = require('express'),
  url = require('url'),
  passport = require('../services/passport'),
  config = require('../config');

var router = express.Router();

function redirect(req, res) {
  var redirectURL = null;

  if (req.query.redirect != null) redirectURL = req.query.redirect;

  if (redirectURL == null) redirectURL = '/map';

  res.redirect(redirectURL);
}

router.get(
  '/',
  function(req, res, next) {
    if (req.user != null) return redirect(req, res);

    var callbackURL = config.moves.callback_url,
      redirect = req.query.redirect;

    // Add redirect to query param
    if (redirect != null) {
      var callbackURLObject = url.parse(callbackURL, true);

      callbackURLObject.query.redirect = req.query.redirect;
      callbackURL = url.format(callbackURLObject);
    }

    // Authenticate
    passport.authenticate(
      'moves',
      {
        callbackURL: callbackURL,
      },
      function(error, user) {
        // @TODO Clean up
        var search = '';

        if (error) return next(error);

        // OAuth error TODO Add flash message.
        if (!user) {
          if (redirect != null) {
            search = url.parse(redirect).search;
          }

          return res.redirect('/' + search);
        }

        // Login user
        req.login(user, next);
      }
    )(req, res);
  },
  redirect
);

router.get('/logout', function(req, res) {
  req.logout();

  var redirectURL = '/';

  if (req.query.redirect != null) {
    redirectURL = req.query.redirect;
  }

  res.redirect(redirectURL);
});

module.exports = router;
