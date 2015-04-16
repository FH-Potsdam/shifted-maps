var express = require('express'),
  JSONStream = require('../services/api/json-stream'),
  User = require('../models/user'),
  Place = require('../models/place'),
  Connection = require('../models/connection');

var router = express.Router();

router.use(function(req, res, next) {
  var stream = new JSONStream();

  stream.pipe(res);
  req.stream = stream;
  next();
});

router.get('/users', function(req) {
  User.find()
    .stream().pipe(req.stream);
});

router.get('/user/places', function(req) {
  Place.find()
    .stream().pipe(req.stream);
});

router.get('/user/connections', function(req) {
  Connection.find()
    .populate('_from')
    .populate('_to')
    .stream().pipe(req.stream);
});

module.exports = router;