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
 *
 * @param user
 * @returns Stream
 */
function getMovesStream(user) {
  if (movesStreams[user.id] != null)
    return movesStreams[user.id];

  var movesStream = new MovesSegmentReader(user.accessToken, user.lastUpdateAt),
    transformer = new MovesTransformer();

  // Delete old moves streams and finish user fetch mode.
  movesStream.on('end', function() {
    delete movesStreams[user.id];

    // Save user as fetched to not request moves data multiple times.
    user.fetched = true;
    user.lastUpdateAt = Date.now();
    user.save();
  });

  // Pipe to writable transformer and then to persister.
  movesStream
    .pipe(transformer)
    .pipe(new Persister(user));

  return movesStream[user.id] = transformer;
}

// HTTP Caching for API requests
router.use(function(req, res, next) {
  res.setHeader('cache-control', 'public');
  res.setHeader('last-modified', req.user.lastUpdateAt.toString());

  if (req.fresh)
    return res.sendStatus(304);

  next();
});

router.get('/user/places', function(req, res) {
  var apiStream = CombinedStream.create(),
    placesStream = req.user.findPlaces().stream();

  apiStream.append(placesStream);

  if (!req.user.fetched) {
    var buffer = new Transform({ objectMode: true });

    // Write moves data (place instances) into buffer to later push it into the API stream
    buffer._transform = function(object, encoding, done) {
      if (object instanceof Place)
        this.push(object);

      done();
    };

    // User is not fetching, so create moves stream
    getMovesStream(req.user).pipe(buffer);
    apiStream.append(buffer);
  }

  // Pipe API stream into JSON stream and JSON stream into response stream
  // This will start the mongoDB query stream.
  apiStream
    .pipe(new JSONStream())
    .pipe(res);
});

router.get('/user/connections', function(req, res) {
  var apiStream = CombinedStream.create(),
    connectionsStream = req.user.findConnections().stream();

  apiStream.append(connectionsStream);

  if (!req.user.fetched) {
    var buffer = new Transform({ objectMode: true });

    // Write moves data (place instances) into buffer to later push it into the API stream
    buffer._transform = function(object, encoding, done) {
      if (object instanceof Connection)
        this.push(object);

      done();
    };

    // User is not fetching, so create moves stream
    getMovesStream(req.user).pipe(buffer);
    apiStream.append(buffer);
  }

  // Pipe API stream into JSON stream and JSON stream into response stream
  // This will start the mongoDB query stream.
  apiStream
    .pipe(new JSONStream())
    .pipe(res);
});

module.exports = router;