var Reflux = require('reflux'),
  Immutable = require('immutable'),
  MapActions = require('../actions/map'),
  nodesStore = require('./nodes'),
  clustersStore = require('./clusters'),
  config = require('../config');

var createMapUrl = (function() {
  var prefix = 'http://api.tiles.mapbox.com/v4/' + config.mapbox.id + '/',
    suffix = '/500x500' + (L.Browser.retina ? '@2x' : '')  + '.png?access_token=' + config.mapbox.token;

  return function(node) {
    var location = node.place.location;

    return prefix + location.lng + ',' + location.lat + ',' + node.zoom + suffix;
  };
})();

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

    if (this.clusters != null)
      this.setClusters(this.clusters);
  },

  setClusters: function(clusters) {
    var nodes = this.nodes,
      map = this.map;

    this.clusters = clusters;

    if (nodes == null || map == null)
      return;

    var tiles = this.tiles,
      bounds = map.getBounds().pad(0.5);

    this.clusters.forEach(function(cluster, key) {
      var node = nodes.get(key);

      if (!bounds.contains(node.place.location))
        return;

      var url = tiles.get(node.id),
        nextUrl = createMapUrl(node);

      if (nextUrl !== url)
        tiles = this.requestMap(node.id, nextUrl);
    }, this);

    this.tiles = tiles;

    this.trigger(tiles);
  },

  requestMap: function(id, url) {
    var image = new Image();

    image.src = url;
    image.onload = function() {
      this.tiles = this.tiles.set(id, url);
      this.trigger(this.tiles);
    }.bind(this);

    return this.tiles.set(id, null);
  },

  getInitialState: function() {
    return this.tiles;
  }
});