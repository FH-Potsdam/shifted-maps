var Reflux = require('reflux'),
  Immutable = require('immutable'),
  constant = require('mout/function/constant'),
  events = require('events'),
  inherits = require('inherits'),
  MapActions = require('../actions/map'),
  nodesStore = require('./nodes'),
  clustersStore = require('./clusters'),
  scalesStore = require('./scales'),
  config = require('../config');

var MAP_URL_PREFIX = 'http://api.tiles.mapbox.com/v4/' + config.mapbox.id + '/',
  MAP_URL_SUFFIX = (L.Browser.retina ? '@2x' : '')  + '.png?access_token=' + config.mapbox.token;

module.exports = Reflux.createStore({

  init: function() {
    this.tiles = Immutable.Map();
    this.requests = {};

    this.map = null;

    this.listenToMany(MapActions);
    this.listenTo(nodesStore, this.setNodes);
    this.listenTo(clustersStore, this.setClusters);
    this.listenTo(scalesStore, this.setScales);

    this.nodes = nodesStore.getInitialState();
    this.clusters = clustersStore.getInitialState();
    this.scales = scalesStore.getInitialState();
  },

  onInit: function(map) {
    this.setMap(map);
  },

  onMoveEnd: function() {
    this.updateTiles();
  },

  setMap: function(map) {
    this.map = map;

    this.updateTiles();
  },

  setNodes: function(nodes) {
    this.nodes = nodes;
    this.radiusScale = nodesStore.radiusScale.copy();

    this.updateTiles();
  },

  setClusters: function(clusters) {
    this.clusters = clusters;

    this.updateTiles();
  },

  setScales: function(scales) {
    this.scales = scales;

    this.updateTiles();
  },

  createMapUrl: function(node, cluster) {
    var nodes = this.nodes,
      bounds = toBounds(node.place.location, config.place_to_bounds_meters);

    cluster.rest().forEach(function(id) {
      if (nodes.has(id))
        bounds.extend(nodes.get(id).place.location);
    });

    var zoom = getBoundsZoom(this.map, bounds, node.radius * 2),
      scale = zoom / this.map.getMaxZoom();

    this.radiusScale.range(this.scales.get('place-radius')(scale));

    var size = Math.ceil(this.radiusScale(node.place.duration) * 2);

    return createMapUrl(bounds.getCenter(), zoom, size);
  },

  createRequest: function(node, url) {
    var request = new Request(url);

    request.once('load', function(tile) {
      this.tiles = this.tiles.set(node.id, tile);
      this.trigger(this.tiles);
    }.bind(this));

    return request;
  },

  requestTile: function(node, cluster) {
    var nextUrl = this.createMapUrl(node, cluster),
      tile = this.tiles.get(node.id);

    if (tile != null && nextUrl === tile.src)
      return false;

    var lastRequest = this.requests[node.id];

    if (lastRequest != null)
      lastRequest.removeAllListeners();

    this.requests[node.id] = this.createRequest(node, nextUrl);

    return true;
  },

  updateTiles: function() {
    var nodes = this.nodes,
      map = this.map,
      clusters = this.clusters;

    if (map == null || nodes.size == 0)
      return;

    var bounds = map.getBounds().pad(0.5),
      tilesStore = this;

    this.tiles = this.tiles.withMutations(function(tiles) {
      clusters.forEach(function(cluster, key) {
        var node = nodes.get(key);

        if (node != null && bounds.contains(node.place.location) && !tilesStore.requestTile(node, cluster))
          return;

        tiles.set(key, null);
      });
    });

    this.trigger(this.tiles);
  },

  getInitialState: function() {
    return this.tiles;
  }
});

function createMapUrl(location, zoom, size) {
  return MAP_URL_PREFIX + location.lng + ',' + location.lat + ',' + zoom + '/' + size + 'x' + size + MAP_URL_SUFFIX;
}

function Request(url) {
  var tile = this.tile = new Image();

  tile.src = url;

  tile.onerror = this.onError.bind(this);
  tile.onload = this.onLoad.bind(this);
}

inherits(Request, events.EventEmitter);

Request.prototype.onError = function(event) {
  this.emit('error', this.tile, event);
};

Request.prototype.onLoad = function(event) {
  var tile = this.tile;

  tile.size = L.Browser.retina ? tile.width / 2 : tile.width;
  tile.radius = tile.size / 2;

  this.emit('load', tile, event);
};

Request.prototype.abort = function() {
  if (!this.tile.complete)
    tile.src = L.Util.emptyImageUrl;
};

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