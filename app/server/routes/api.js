var express = require('express'),
  path = require('path'),
  moment = require('moment'),
  JSONStream = require('../services/api/json-stream'),
  Normalizer = require('../services/api/normalizer'),
  Limiter = require('../services/api/limiter'),
  MovesSegmentReader = require('../services/moves/segment-reader'),
  MovesAPI = require('../services/moves/api'),
  MovesLimiter = require('../services/moves/limiter'),
  MovesTransformer = require('../services/moves/transformer'),
  config = require('../config');

var router = express.Router(),
  limiter = new MovesLimiter(),
  demoPath = path.resolve(__dirname + '/../data/demo.json');

// HTTP Caching for API requests
router.get('/', function(req, res, next) {
  if (req.user == null)
    return next();

  res.setHeader('cache-control', 'public, max-age=0');
  res.setHeader('last-modified', req.user.lastUpdateAt.toString());

  if (req.fresh)
    return res.sendStatus(304);

  next();
});

router.get('/', function(req, res) {
  var user = req.user;

  // No user logged in. Return demo data.
  if (user == null)
    return res.sendFile(demoPath);

  var api = new MovesAPI(user.accessToken, limiter, config.moves),
    segmentReader = new MovesSegmentReader(api, user.firstDate);

  req.on('close', function() {
    segmentReader.destroy();
  });

  segmentReader
    .pipe(new MovesTransformer)
    .pipe(new Limiter(config.api.place_limit))
    .pipe(new Normalizer)
    .pipe(new JSONStream)
    .pipe(res);
});

module.exports = router;