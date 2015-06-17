var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  nodesStore = require('./nodes'),
  connectionsStore = require('./connections'),
  visStore = require('./vis')
  Edge = require('../models/edge');

module.exports = Reflux.createStore({
  init: function() {
    this.edges = Immutable.Map();

    this.nodes = null;
    this.connections = null;
    this.lastScale = null;

    this.minStrokeWidthScale = d3.scale.linear().range([.5, 2]);
    this.maxStrokeWidthScale = d3.scale.linear().range([5, 15]);

    this.strokeWidthScale = d3.scale.pow().exponent(.25);

    this.listenTo(connectionsStore, this.setConnections);
    this.listenTo(nodesStore, this.setNodes);
    this.listenTo(visStore, this.onVisChange);
  },

  setConnections: function(connections) {
    var nodes = this.nodes;

    this.connections = connections;

    if (nodes == null)
      return;

    var minFrequency = Infinity,
      maxFrequency = -Infinity;

    connections.forEach(function(connection) {
      var frequency = connection.trips.size;

      minFrequency = Math.min(minFrequency, frequency);
      maxFrequency = Math.max(maxFrequency, frequency);
    });

    var placeStrokeWidthScale = this.strokeWidthScale.domain([minFrequency, maxFrequency]);

    this.edges = connections.reduce(function(edges, connection, id) {
      var to = nodes.get(connection.to),
        from = nodes.get(connection.from);

      if (to == null || from == null)
        return edges;

      return edges.set(id, new Edge({
        to: to,
        from: from,
        strokeWidth: placeStrokeWidthScale(connection.trips.size),
        connection: connection
      }));
    }, Immutable.Map());

    this.trigger(this.edges);
  },

  setNodes: function(nodes) {
    this.nodes = nodes;

    if (this.connections == null)
      return;

    this.setConnections(this.connections);
  },

  onVisChange: function(vis) {
    var scale = vis.get('scale');

    if (scale === this.lastScale)
      return;

    this.strokeWidthScale.range([
      this.minStrokeWidthScale(scale),
      this.maxStrokeWidthScale(scale)]);

    this.lastScale = scale;
  },

  getInitialState: function() {
    return this.edges;
  }
});