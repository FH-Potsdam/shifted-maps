var express = require('express'),
  request = require('request'),
  tiles = require('../services/tiles'),
  config = require('../config');

var router = express.Router();

router.param('locations', function(req, res, next, locations) {
  locations = locations.split(';');

  try {
    req.locations = locations.map(function(location) {
      var lngLat = location.split(',').map(parseFloat);

      if (lngLat.length !== 2)
        throw new Error('Invalid location: ' + lngLat);

      return lngLat;
    });
  } catch (e) {
    return next(e);
  }

  next();
});

router.param('radius', function(req, res, next, radius) {
  req.radius = parseFloat(radius);
  next();
});

router.param('retina', function(req, res, next, retina) {
  req.retina = retina === '@2x';
  next();
});

router.get('/:locations/:radius.png:retina?', function(req, res) {
  var url = tiles(req.locations, req.radius, {
    mapboxUrl: config.mapbox.api_url,
    mapboxId: config.mapbox.id,
    mapboxToken: config.mapbox.token,
    placeToBoundsMeters: config.tiles.place_to_bounds_meters,
    retina: req.retina
  });

  request(url).pipe(res);

  /*var lng = parseFloat(req.params.lng),
    lat = parseFloat(req.params.lat),
    radius = Math.ceil(parseFloat(req.params.radius));

  var lngLat = [lng, lat],
    retina = req.params.retina === '@2x';

  var url = tiles(lngLat, radius, {
    mapboxUrl: config.mapbox.api_url,
    mapboxId: config.mapbox.id,
    mapboxToken: config.mapbox.token,
    placeToBoundsMeters: config.tiles.place_to_bounds_meters,
    retina: retina
  });

  request(url).pipe(res);*/
});

module.exports = router;