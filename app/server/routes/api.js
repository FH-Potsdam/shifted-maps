var express = require('express'),
  moment = require('moment'),
  JSONStream = require('../services/api/json-stream'),
  Normalizer = require('../services/api/normalizer'),
  MovesSegmentReader = require('../services/moves/segment-reader'),
  MovesAPI = require('../services/moves/api'),
  MovesLimiter = require('../services/moves/limiter'),
  MovesTransformer = require('../services/moves/transformer'),
  config = require('../config');

var router = express.Router(),
  limiter = new MovesLimiter();

router.use(function(req, res, next) {
  if (!req.user)
    return res.sendStatus(403);

  next();
});

// HTTP Caching for API requests
router.use(function(req, res, next) {
  res.setHeader('cache-control', 'public, max-age=0');
  res.setHeader('last-modified', req.user.lastUpdateAt.toString());

  if (req.fresh)
    return res.sendStatus(304);

  next();
});

router.get('/', function(req, res) {
  var user = req.user,
    api = new MovesAPI(user.accessToken, limiter, config.moves),
    segmentReader = new MovesSegmentReader(api, user.firstDate);

  req.on('close', function() {
    segmentReader.destroy();
  });

  segmentReader
    .pipe(new MovesTransformer)
    .pipe(new Normalizer)
    .pipe(new JSONStream)
    .pipe(res);
});

module.exports = router;