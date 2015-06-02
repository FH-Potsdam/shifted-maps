var express = require('express'),
  moment = require('moment'),
  JSONStream = require('../services/api/json-stream'),
  Normalizer = require('../services/api/normalizer'),
  MovesSegmentReader = require('../services/moves/segment-reader'),
  MovesTransformer = require('../services/moves/transformer');

var router = express.Router();

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
    segmentReader = new MovesSegmentReader(user.accessToken, user.firstDate);

  segmentReader.on('initRequest', function() {
    segmentReader.pause();
    setTimeout(function() {
      segmentReader.resume();
    }, 500);
  });

  segmentReader
    .pipe(new MovesTransformer)
    .pipe(new Normalizer)
    .pipe(new JSONStream)
    .pipe(res);
});

module.exports = router;