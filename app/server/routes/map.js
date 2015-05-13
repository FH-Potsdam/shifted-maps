var express = require('express'),
  MovesSegmentReader = require('../services/moves/segment-reader'),
  JSONStream = require('../services/api/json-stream'),
  MovesTransformer = require('../services/moves/transformer');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.send();
});

router.get('/test', function(req, res) {
  res.render('obeo-test.nunj');
});

module.exports = router;