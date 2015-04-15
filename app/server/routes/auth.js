var express = require('express'),
  url = require('url'),
  passport = require('../services/passport'),
  config = require('../config');

var router = express.Router();

router.get('/', function(req, res, next) {
  var callbackURL = config.moves.callback_url,
    redirectURL = req.param.redirect;

  // Add redirect to query param
  if (redirectURL != null) {
    var callbackURLObject = url.parse(callbackURL, true);

    callbackURLObject.query.redirect = redirectURL;
    callbackURL = url.format(callbackURLObject);
  }

  passport.authenticate('moves', {
    callbackURL: callbackURL
  })(req, res, next);
});

router.get('/callback',
  passport.authenticate('moves', { failureRedirect: '/auth' }),
  function(req, res) {
    var redirectURL = null;

    if (req.param.redirect != null) {
      redirectURL = url.parse(req.param.redirect).path;
    }

    if (redirectURL == null) {
      redirectURL = '/map';
    }

    res.redirect(redirectURL);
  });

module.exports = router;