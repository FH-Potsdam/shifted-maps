var express = require('express'),
  JSONStream = require('../services/api/json-stream'),
  geocode = require('../services/geocode'),
  User = require('../models/user'),
  Place = require('../models/place'),
  Connection = require('../models/connection');

var router = express.Router();

router.get('/geocode/:latitude,:longitude', function(req, res, next) {
  geocode([req.params.latitude, req.params.longitude], function(error, value) {
    if (error)
      return next(error);

    res.json(value);
  });
});

router.get('/user/places', function(req, res) {
  Place.find()
    .stream().pipe(new JSONStream()).pipe(res);
});

router.get('/user/connections', function(req, res) {
  Connection.find()
    .populate('_from')
    .populate('_to')
    .stream().pipe(new JSONStream()).pipe(res);
});

module.exports = router;