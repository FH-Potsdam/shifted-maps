var reduce = require('lodash/collection/reduce'),
  SphericalMercator = require('sphericalmercator');

var MAP_URL_PREFIX = function(options) {
  return options.mapboxUrl + '/' + options.mapboxId + '/';
};

var MAP_URL_SUFFIX = function(options) {
  return (options.retina ? '@2x' : '')  + '.png?access_token=' + options.mapboxToken;
};

function computeBounds(locations, options) {
  return reduce(locations, function(bounds, location) {
    var nextBounds = toBounds(location, options.placeToBoundsMeters);

    if (bounds == null)
      return nextBounds;

    return extendBounds(bounds, nextBounds);
  }, null);
}

// Calculate bounding box with given size in meters and the given location at it's center.
// Copied from Leafvar.
function toBounds(lngLat, sizeInMeters) {
  var latAccuracy = 180 * sizeInMeters / 40075017,
    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * lngLat[1]);

  return [
    [lngLat[0] - lngAccuracy, lngLat[1] - latAccuracy],
    [lngLat[0] + lngAccuracy, lngLat[1] + latAccuracy]
  ];
}

function extendBounds(bounds, nextBounds) {
  return [
    [
      Math.min(bounds[0][0], nextBounds[0][0]),
      Math.min(bounds[0][1], nextBounds[0][1])
    ],
    [
      Math.max(bounds[1][0], nextBounds[1][0]),
      Math.max(bounds[1][1], nextBounds[1][1])
    ]
  ];
}

var projection = new SphericalMercator();

// Get maximum zoom for showing given bounding box in the given pixel size.
// Taken from Leafvar libraries Map object but added own size parameter.
// Copied from Leafvar (with own size parameter).
function computeBoundsZoom(bounds, size) {
  var zoom = 0,
    maxZoom = 19, // TODO config
    nw = bounds[1],
    se = bounds[0],
    zoomNotFound = true,
    sepx, nwpx, boundsSize;

  do {
    zoom++;

    sepx = projection.px(se, zoom);
    nwpx = projection.px(nw, zoom);

    boundsSize = Math.max(Math.abs(sepx[0] - nwpx[0]), Math.abs(sepx[1] - nwpx[1]));

    zoomNotFound = boundsSize <= size;
  } while (zoomNotFound && zoom <= maxZoom);

  return zoom - 1;
}

// Compute tile URL
function computeTileUrl(bounds, zoom, size, options) {
  var prefix = MAP_URL_PREFIX(options),
    suffix = MAP_URL_SUFFIX(options);

  console.log(bounds[1][0] + bounds[1][1]);

  var center = [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2
  ];

  return prefix + center.join(',') + ',' + zoom + '/' + size + 'x' + size + suffix;
}

module.exports = function(locations, radius, options) {
  var size = radius * 2,
    bounds = computeBounds(locations, options),
    zoom = computeBoundsZoom(bounds, size),
    url = computeTileUrl(bounds, zoom, size, options);

  return url;
};