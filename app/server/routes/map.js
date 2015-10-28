var express = require('express'),
  config = require('../config');

var router = express.Router();

router.get('*', function(req, res) {
  res.render('map', {
    env: { authorized: !!req.user, place_limit: config.api.place_limit }
  });
});

module.exports = router;