var express = require('express'),
  request = require('request'),
  tiles = require('../services/tiles'),
  config = require('../config');

var router = express.Router();

router.get('/:lng,:lat,:radius.png:retina?', function(req, res) {
  var lng = parseFloat(req.params.lng),
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

  request(url).pipe(res);
});

module.exports = router;