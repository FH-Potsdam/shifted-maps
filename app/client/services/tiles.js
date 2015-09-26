import { mapbox, place_to_bounds_meters, place_min_tile_size } from '../config';

const MAP_URL_PREFIX = 'http://api.tiles.mapbox.com/v4/' + mapbox.id + '/';
const MAP_URL_SUFFIX = (L.Browser.retina ? '@2x' : '')  + '.png?access_token=' + mapbox.token;

export function createTileRequest(place, map, radiusScale, radiusRangeScale) {
  let { location, radius, duration} = place,
    zoom = computeZoom(location, radius, map),
    size = computeSize(duration, map, zoom, radiusScale, radiusRangeScale),
    url = computeTileUrl(location, zoom, size);

  return new Request(place.id, url);
}

class Request {
  constructor(id, url) {
    this.id = id;
    this.url = url;
  }

  send(done) {
    let { id, url } = this,
      tile = new Image();

    tile.src = url;

    tile.onerror = event => done(event);
    tile.onload = function() {
      let width = L.Browser.retina ? tile.width / 2 : tile.width,
        height = L.Browser.retina ? tile.height / 2 : tile.height;

      done(null, { id, url, width, height });
    };
  }
}

function computeZoom(location, radius, map) {
  let bounds = toBounds(location, place_to_bounds_meters);

  return getBoundsZoom(map, bounds, radius * 2);
}

function computeSize(duration, map, zoom, radiusScale, radiusRangeScale) {
  let scale = zoom / map.getMaxZoom();

  radiusScale = radiusScale.copy()
    .range(radiusRangeScale(scale));

  return Math.max(place_min_tile_size, Math.ceil(radiusScale(duration) * 2));
}

function computeTileUrl(location, zoom, size) {
  return MAP_URL_PREFIX + location.lng + ',' + location.lat + ',' + zoom + '/' + size + 'x' + size + MAP_URL_SUFFIX;
}

// @TODO Replace with leaflet function, if mapbox js library was updated. (v1.0)
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