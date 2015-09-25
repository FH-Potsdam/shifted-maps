import { mapbox, place_to_bounds_meters, place_min_tile_size } from '../config';

const MAP_URL_PREFIX = 'http://api.tiles.mapbox.com/v4/' + mapbox.id + '/';
const MAP_URL_SUFFIX = (L.Browser.retina ? '@2x' : '')  + '.png?access_token=' + mapbox.token;

export default function tileRequester(node, map, radiusScale, radiusRangeScale, done) {
  let url = computeTileUrl(node, map, radiusScale, radiusRangeScale);

  computeRequest(url, done);
}

function computeTileUrl(node, map, radiusScale, radiusRangeScale) {
  let { location } = node,
    bounds = toBounds(location, place_to_bounds_meters),
    zoom = getBoundsZoom(map, bounds, node.radius * 2),
    scale = zoom / map.getMaxZoom();

  radiusScale = radiusScale.copy()
    .range(radiusRangeScale(scale));

  let size = Math.max(place_min_tile_size, Math.ceil(radiusScale(node.duration) * 2));

  return MAP_URL_PREFIX + location.lng + ',' + location.lat + ',' + zoom + '/' + size + 'x' + size + MAP_URL_SUFFIX;
}

function computeRequest(url, done) {
  let tile = new Image();

  tile.src = url;

  tile.onerror = event => done(event);
  tile.onload = function() {
    let size = L.Browser.retina ? tile.width / 2 : tile.width,
      radius = size / 2;

    done(null, { url, size, radius });
  };
}

// @TODO Replace with leaflet function, if mapbox js library was updated.
function toBounds(location, sizeInMeters) {
  var latAccuracy = 180 * sizeInMeters / 40075017,
    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * location.lat);

  return L.latLngBounds(
    [location.lat - latAccuracy, location.lng - lngAccuracy],
    [location.lat + latAccuracy, location.lng + lngAccuracy]);
}

// Taken from Leaflet libraries Map object but added own size parameter.
function getBoundsZoom(map, bounds, size) {
  bounds = L.latLngBounds(bounds);
  size = L.point([size, size]);

  var zoom = map.getMinZoom(),
    maxZoom = map.getMaxZoom(),
    nw = bounds.getNorthWest(),
    se = bounds.getSouthEast(),
    zoomNotFound = true,
    boundsSize;

  do {
    zoom++;
    boundsSize = map.project(se, zoom).subtract(map.project(nw, zoom)).floor();
    zoomNotFound = size.contains(boundsSize);
  } while (zoomNotFound && zoom <= maxZoom);

  return zoom - 1;
}