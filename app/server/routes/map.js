var express = require('express'),
  moves = require('../services/moves');

var router = express.Router();

router.get('/', function(req, res, next) {
  moves.get('/user/profile', req.user.accessToken, function(error, response, body) {
    if (error)
      return next(error);

    res.send(body);
  });
});

module.exports = router;