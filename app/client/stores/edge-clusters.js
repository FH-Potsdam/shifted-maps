var Reflux = require('reflux'),
  Immutable = require('immutable'),
  edgesStore = require('./edges'),
  nodesStore = require('./nodes'),
  clustersStore = require('./clusters'),
  EdgeCluster = require('../models/edge-cluster');

module.exports = Reflux.createStore({

  init: function() {
    this.edgeClusters = Immutable.Map();

    this.listenTo(nodesStore, this.setNodes);
    this.listenTo(edgesStore, this.setEdges);
    this.listenTo(clustersStore, this.setClusters);

    this.nodes = nodesStore.getInitialState();
    this.edges = edgesStore.getInitialState();
    this.clusters = clustersStore.getInitialState();
  },

  setNodes: function(nodes) {
    this.nodes = nodes;

    this.updateClusters();
  },

  setEdges: function(edges) {
    this.edges = edges;

    this.updateClusters();
  },

  setClusters: function(clusters) {
    this.clusters = clusters;

    this.updateClusters();
  },

  updateClusters: function() {
    var nodes = this.nodes,
      edges = this.edges.toList();

    var clusters = this.clusters.toSeq()
      .map(function(cluster) {
        return cluster.toSeq()
          .map(function(id) {
            return nodes.get(id);
          })
          .filter(function(node) {
            return node != null;
          })
          .flatMap(function(node) {
            return edges.filter(function(edge) {
              return edge.to === node || edge.from === node;
            });
          })
          .toSet();
      })
      .filter(function(cluster) {
        return cluster.size > 0;
      })
      .toList();

    this.edgeClusters = Immutable.List().withMutations(function(edgeClusters) {
      for (var i = 0; i < clusters.size; i++) {
        var clusterOne = clusters.get(i);

        for (var j = i + 1; j < clusters.size; j++) {
          var clusterTwo = clusters.get(j),
            intersection = clusterOne.intersect(clusterTwo);

          if (intersection.size == 0)
            continue;

          intersection = intersection
            .toOrderedSet()
            .sortBy(function(edge) {
              return -edge.strokeWidth;
            });

          var mainEdge = intersection.first().toJS();
          mainEdge.edges = intersection.rest().toList();

          edgeClusters.push(new EdgeCluster(mainEdge));
        }
      }
    });

    this.trigger(this.edgeClusters);
  },

  getInitialState: function() {
    return this.clusters;
  }
});