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
    this.connections = connections;

    var minFrequency = Infinity,
      maxFrequency = -Infinity;

    connections.forEach(function(connection) {
      var frequency = connection.trips.size;

      minFrequency = Math.min(minFrequency, frequency);
      maxFrequency = Math.max(maxFrequency, frequency);
    });

    this.strokeWidthScale.domain([minFrequency, maxFrequency]);

    this.updateEdges();
  },

  setNodes: function(nodes) {
    this.nodes = nodes;

    this.updateEdges();
  },

  onUpdateVis: function(scale) {
    this.scale = scale;
    this.strokeWidthScale.range(STROKE_WIDTH_SCALE(scale));

    this.updateEdges();
  },

  updateEdges: function() {
    var connections = this.connections,
      nodes = this.nodes,
      strokeWidthScale = this.strokeWidthScale;

    if (connections == null || nodes == null || this.scale == null)
      return;

    this.edges = Immutable.Map().withMutations(function(edges) {
      connections.forEach(function(connection, key) {
        var to = nodes.get(connection.to),
          from = nodes.get(connection.from);

        if (to == null || from == null)
          return;

        edges.set(key, new Edge({
          to: to,
          from: from,
          strokeWidth: strokeWidthScale(connection.trips.size),
          connection: connection
        }));
      });
    });

    this.trigger(this.edges);
  },

  getInitialState: function() {
    return this.edges;
  }
});