var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  nodesStore = require('./nodes'),
  scalesStore = require('./scales'),
  connectionsStore = require('./connections'),
  Edge = require('../models/edge'),
  VisActions = require('../actions/vis'),
  config = require('../config');

var STROKE_WIDTH_SCALE = config.edge_stroke_width_scale.copy();

module.exports = Reflux.createStore({
  init: function() {
    this.edges = Immutable.Map();

    this.scaled = false;
    this.scale = null;

    this.strokeWidthScale = d3.scale.pow().exponent(.25);

    this.listenTo(connectionsStore, this.setConnections);
    this.listenTo(nodesStore, this.setNodes);
    this.listenTo(scalesStore, this.setScales);
    this.listenTo(VisActions.update, this.onUpdateVis);

    this.connections = connectionsStore.getInitialState();
    this.nodes = nodesStore.getInitialState();
    this.scales = scalesStore.getInitialState();
  },

  setConnections: function(connections) {
    this.connections = connections;

    this.updateScaleDomain();
  },

  setNodes: function(nodes) {
    this.nodes = nodes;

    this.updateScaleDomain();
  },

  setScales: function(scales) {
    this.scales = scales;

    this.updateScales();
  },

  updateScales: function() {
    if (this.scale == null)
      return;

    var strokeWidthScale = this.scales.get('edge-stroke-width');

    this.strokeWidthScale.range(strokeWidthScale(this.scale));

    this.updateEdges();
  },

  onUpdateVis: function(scale) {
    this.scale = scale;

    this.updateScales();
  },

  updateScaleDomain: function() {
    var minFrequency = Infinity,
      maxFrequency = -Infinity;

    this.connections.forEach(function(connection) {
      var frequency = connection.trips.size;

      minFrequency = Math.min(minFrequency, frequency);
      maxFrequency = Math.max(maxFrequency, frequency);
    });

    this.strokeWidthScale.domain([minFrequency, maxFrequency]);

    this.updateEdges();
  },

  updateEdges: function() {
    var connections = this.connections,
      nodes = this.nodes,
      strokeWidthScale = this.strokeWidthScale;

    if (this.scale == null)
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