import { mapbox, place_to_bounds_meters, place_min_tile_size } from '../config';

const MAP_URL_PREFIX = 'http://api.tiles.mapbox.com/v4/' + mapbox.id + '/';
const MAP_URL_SUFFIX = (L.Browser.retina ? '@2x' : '')  + '.png?access_token=' + mapbox.token;

export function createTileRequest(place, map, radiusScale, radiusRangeScale, done) {
  let { location, radius, duration} = place;

  computeZoom(location, radius, map, function(error, zoom) {
    computeSize(duration, map, zoom, radiusScale, radiusRangeScale, function(error, size) {
      let url = computeTileUrl(location, zoom, size);

      done(null, new Request(place.id, url));
    })
  });
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

function computeZoom(location, radius, map, done) {
  toBounds(location, place_to_bounds_meters, function(error, bounds) {
    getBoundsZoom(map, bounds, radius * 2, function(error, zoom) {
      done(null, zoom);
    });
  });
}

function computeSize(duration, map, zoom, radiusScale, radiusRangeScale, done) {
  process.nextTick(function() {
    let scale = zoom / map.getMaxZoom();

    radiusScale = radiusScale.copy()
      .range(radiusRangeScale(scale));

    let size = Math.max(place_min_tile_size, Math.ceil(radiusScale(duration) * 2));

    done(null, size);
  });
}

// @TODO Replace with leaflet function, if mapbox js library was updated. (v1.0)
function toBounds(location, sizeInMeters, done) {
  process.nextTick(function() {
    var latAccuracy = 180 * sizeInMeters / 40075017,
      lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * location.lat);

    let bounds = L.latLngBounds(
      [location.lat - latAccuracy, location.lng - lngAccuracy],
      [location.lat + latAccuracy, location.lng + lngAccuracy]);

    done(null, bounds);
  });
}

// Taken from Leaflet libraries Map object but added own size parameter.
function getBoundsZoom(map, bounds, size, done) {
  process.nextTick(function() {
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

    done(null, zoom);
  });
}

function computeTileUrl(location, zoom, size) {
  return MAP_URL_PREFIX + location.lng + ',' + location.lat + ',' + zoom + '/' + size + 'x' + size + MAP_URL_SUFFIX;
}