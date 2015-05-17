var express = require('express'),
  Place = require('../models/place'),
  Connection = require('../models/connection'),
  JSONStream = require('../services/api/json-stream'),
  MovesSegmentReader = require('../services/moves/segment-reader'),
  MovesTransformer = require('../services/moves/transformer'),
  Persister = require('../services/persister'),
  Transform = require('stream').Transform,
  CombinedStream = require('combined-stream');

var router = express.Router();

// Moves stream hash for API router
var movesStreams = {};

/**
 * Gets the moves segment reader for the given user.
 * If no segment reader stream is available, create a new one.
 */
function getMovesStream(user, callback) {
  if (movesStreams[user.id] != null)
    return movesStreams[user.id];

  var movesStream = new MovesSegmentReader(user.accessToken, user.lastUpdateAt),
    transformer = new MovesTransformer(),
    persister = new Persister(user);

  persister.on('data', function(object) {
    if (object instanceof Place)
      user.addPlace(object);
    else if (object instanceof Connection)
      user.addConnection(object);
  });

  // Reset user places and connections if persister fires error events.
  persister.on('error', function(error) {
    user.reset()
      .onResolve(function() {
        callback(error);
      });
  });

  // Delete old moves streams and finish user fetch mode.
  persister.on('finish', function() {
    delete movesStreams[user.id];
    user.update(callback);
  });

  // Pipe to writable transformer and then to persister.
  movesStream
    .pipe(transformer)
    .pipe(persister);

  return movesStream[user.id] = persister;
}

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

router.use(function(req, res, next) {
  // Do not start moves stream, if we already fetched it.
  if (req.user.fetched)
    return next();

  // Pause response till the moves stream has finished.
  getMovesStream(req.user, next);
});

router.get('/user/places', function(req, res, next) {
  var placesStream = req.user.findPlaces()
    .populate('_user')
    .sort({ duration: -1, frequency: -1 })
    .stream();

  // Pipe API stream into JSON stream and JSON stream into response stream
  // This will start the mongoDB query stream.
  placesStream
    .pipe(new JSONStream())
    .pipe(res);
});

router.get('/user/connections', function(req, res, next) {
  var jsonStream = new JSONStream();

  var connectionsStream = req.user.findConnections()
    .populate('_user')
    .stream();

  // Pipe API stream into JSON stream and JSON stream into response stream
  // This will start the mongoDB query stream.
  connectionsStream
    .pipe(jsonStream)
    .pipe(res);
});

module.exports = router;