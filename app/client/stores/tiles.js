var Reflux = require('reflux'),
  Immutable = require('immutable'),
  MapActions = require('../actions/map'),
  nodesStore = require('./nodes'),
  clustersStore = require('./clusters'),
  config = require('../config');

var MAP_URL_PREFIX = 'http://api.tiles.mapbox.com/v4/' + config.mapbox.id + '/',
  MAP_URL_SUFFIX = (L.Browser.retina ? '@2x' : '')  + '.png?access_token=' + config.mapbox.token;

function createMapUrl(location, zoom, size) {
  return MAP_URL_PREFIX + location.lng + ',' + location.lat + ',' + zoom + '/' + size + 'x' + size + MAP_URL_SUFFIX;
}

function requestTile(url, done) {
  var tile = new Image();

  tile.src = url;

  tile.onload = function() {
    this.size = L.Browser.retina ? this.width / 2 : this.width;
    this.radius = this.size / 2;

    done(this);
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

module.exports = Reflux.createStore({

  init: function() {
    this.tiles = Immutable.Map();
    this.requests = {};

    this.map = null;
    this.nodes = null;
    this.clusters = null;

    this.listenToMany(MapActions);
    this.listenTo(nodesStore, this.setNodes);
    this.listenTo(clustersStore, this.setClusters);
  },

  onInit: function(map) {
    this.setMap(map);
  },

  onMoveEnd: function() {
    if (this.clusters != null)
      this.setClusters(this.clusters);
  },

  setMap: function(map) {
    this.map = map;

    if (this.clusters != null)
      this.setClusters(this.clusters);
  },

  setNodes: function(nodes) {
    this.nodes = nodes;
    this.radiusScale = nodesStore.radiusScale.copy();

    if (this.clusters != null)
      this.setClusters(this.clusters);
  },

  setClusters: function(clusters) {
    var nodes = this.nodes,
      map = this.map;

    this.clusters = clusters;

    if (nodes == null || map == null)
      return;

    var bounds = map.getBounds().pad(0.5),
      tilesStore = this;

    this.tiles = this.tiles.withMutations(function(tiles) {
      clusters.forEach(function(cluster, key) {
        var node = nodes.get(key);

        if (bounds.contains(node.place.location)) {
          var nextUrl = tilesStore.createMapUrl(node, cluster),
            tile = tiles.get(node.id);

          if (tile != null && nextUrl === tile.src)
            return;

          tilesStore.requestTile(node, nextUrl);
        }

        tiles.set(node.id, null);
      });
    });

    this.trigger(this.tiles);
  },

  createMapUrl: function(node, cluster) {
    var nodes = this.nodes,
      bounds = toBounds(node.place.location, 200);

    cluster.rest().forEach(function(id) {
      bounds.extend(nodes.get(id).place.location);
    });

    var zoom = getBoundsZoom(this.map, bounds, node.radius * 2),
      scale = zoom / this.map.getMaxZoom();

    this.radiusScale.range(config.radius_scale(scale));

    var size = Math.ceil(this.radiusScale(node.place.duration) * 2);

    return createMapUrl(bounds.getCenter(), zoom, size);
  },

  requestTile: function(node, url) {
    requestTile(url, function(tile) {
      this.tiles = this.tiles.set(node.id, tile);
      this.trigger(this.tiles);
    }.bind(this));
  },

  getInitialState: function() {
    return this.tiles;
  }
});