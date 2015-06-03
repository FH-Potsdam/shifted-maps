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

  // @TODO for moves request
  // Compare new request time (for minute and hour) with last request time (minute and hour)
  // If new request time is bigger than a minute or hour, reset accordingly
  // Check how many requests remain and delay new request accordingly

  segmentReader.on('initRequest', function() {
    console.log('initRequest', arguments);
  });

  segmentReader
    .pipe(new MovesTransformer)
    .pipe(new Normalizer)
    .pipe(new JSONStream)
    .pipe(res);
});

module.exports = router;