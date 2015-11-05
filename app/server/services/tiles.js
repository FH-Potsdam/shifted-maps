var SphericalMercator = require('sphericalmercator');

var MAP_URL_PREFIX = function(options) {
  return options.mapboxUrl + '/' + options.mapboxId + '/';
};

var MAP_URL_SUFFIX = function(options) {
  return (options.retina ? '@2x' : '')  + '.png?access_token=' + options.mapboxToken;
};

// Compute maximum zoom at given location for given pixel size.
function computeZoom(lngLat, size, options) {
  var bounds = toBounds(lngLat, options.placeToBoundsMeters);

  return getBoundsZoom(bounds, size);
}

// Calculate bounding box with given size in meters and the given location at it's center.
// Copied from Leaflet.
function toBounds(lngLat, sizeInMeters) {
  var latAccuracy = 180 * sizeInMeters / 40075017,
    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * lngLat[1]);

  return [
    [lngLat[0] - lngAccuracy, lngLat[1] - latAccuracy],
    [lngLat[0] + lngAccuracy, lngLat[1] + latAccuracy]
  ];
}

var projection = new SphericalMercator();

// Get maximum zoom for showing given bounding box in the given pixel size.
// Taken from Leaflet libraries Map object but added own size parameter.
// Copied from Leaflet (with own size parameter).
function getBoundsZoom(bounds, size) {
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
function computeTileUrl(lngLat, zoom, size, options) {
  var prefix = MAP_URL_PREFIX(options),
    suffix = MAP_URL_SUFFIX(options);

  return prefix + lngLat.join(',') + ',' + zoom + '/' + size + 'x' + size + suffix;
}

module.exports = function(lngLat, radius, options) {
  var size = radius * 2,
    zoom = computeZoom(lngLat, radius, options),
    url = computeTileUrl(lngLat, zoom, size, options);

  return url;
};