var express = require('express'),
  moment = require('moment'),
  Place = require('../models/place'),
  Connection = require('../models/connection'),
  Visit = require('../models/visit'),
  Trip = require('../models/trip'),
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

function limitQuery(query, req) {
  if (req.startAt != null)
    query.gte('startAt', req.startAt.startOf('day').toDate());

  if (req.endAt != null)
    query.lte('endAt', req.endAt.endOf('day').toDate());
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

router.get('/user/places', function(req, res) {
  Place.find({ _user: req.user }).stream()
    .pipe(new JSONStream())
    .pipe(res);
});

router.get('/user/connections', function(req, res) {
  Connection.find({ _user: req.user }).stream()
    .pipe(new JSONStream())
    .pipe(res);
});

router.use(function(req, res, next) {
  if (req.query.startAt != null)
    req.startAt = moment(req.query.startAt);

  if (req.query.endAt != null)
    req.endAt = moment(req.query.endAt);

  next();
});

router.get('/user/visits', function(req, res) {
  var visitsQuery = Visit.find({ _user: req.user });

  limitQuery(visitsQuery, req);

  visitsQuery.stream()
    .pipe(new JSONStream())
    .pipe(res);
});

router.get('/user/trips', function(req, res) {
  var tripsQuery = Trip.find({ _user: req.user });

  limitQuery(tripsQuery, req);

  tripsQuery.stream()
    .pipe(new JSONStream())
    .pipe(res);
});

module.exports = router;