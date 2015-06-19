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
          var nextUrl = tilesStore.createMapUrl(node),
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

  createMapUrl: function(node) {
    var scale = node.zoom / this.map.getMaxZoom();

    this.radiusScale.range(config.radius_scale(scale));

    var size = Math.ceil(this.radiusScale(node.place.duration) * 2);

    return createMapUrl(node.place.location, node.zoom, size);
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