var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  nodesStore = require('./nodes'),
  connectionsStore = require('./connections'),
  Edge = require('../models/edge'),
  VisActions = require('../actions/vis');

var STROKE_WIDTH_SCALE = d3.scale.linear().range([[.5, 2], [2, 15]]);

module.exports = Reflux.createStore({
  init: function() {
    this.edges = Immutable.Map();

    this.nodes = null;
    this.connections = null;
    this.scale = null;

    this.strokeWidthScale = d3.scale.pow().exponent(.25);

    this.listenTo(connectionsStore, this.setConnections);
    this.listenTo(nodesStore, this.setNodes);
    this.listenTo(VisActions.update, this.onUpdateVis);
  },

  setConnections: function(connections) {
    var nodes = this.nodes;

    this.connections = connections;

    if (nodes == null || this.scale == null)
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

  onUpdateVis: function(scale) {
    this.scale = scale;
    this.strokeWidthScale.range(STROKE_WIDTH_SCALE(scale));

    if (this.connections == null)
      return;

    this.setConnections(this.connections);
  },

  getInitialState: function() {
    return this.edges;
  }
});