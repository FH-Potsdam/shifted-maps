var Reflux = require('reflux'),
  Immutable = require('immutable'),
  nodesStore = require('./nodes');

function calcDist(nodeOne, nodeTwo){
  return Math.sqrt(Math.pow(nodeTwo.point.x - nodeOne.point.x, 2) + Math.pow(nodeTwo.point.y - nodeOne.point.y, 2));
}

module.exports = Reflux.createStore({

  init: function() {
    this.clusters = Immutable.Map();

    this.listenTo(nodesStore, this.setNodes);

    this.nodes = nodesStore.getInitialState();
  },

  setNodes: function(nodes) {
    this.nodes = nodes;

    this.updateClusters();
  },

  updateClusters: function() {
    // Remove keys and transform map to a normal array of objects
    var nodes = this.nodes.toList().toJS();

    var clusters = Immutable.Map().withMutations(function(clusters) {
      for (var i = 0; i < nodes.length; i++) {
        var nodeOne = nodes[i];

        if (nodeOne.clustered)
          continue;

        nodeOne.clustered = true;

        var cluster = Immutable.OrderedSet([nodeOne.id]).withMutations(function(cluster) {
          for (var i = 0; i < nodes.length; i++) {
            var nodeTwo = nodes[i];

            if (nodeTwo.clustered)
              continue;

            if (calcDist(nodeOne, nodeTwo) < nodeOne.radius) {
              nodeTwo.clustered = true;
              cluster.add(nodeTwo.id);
            }
          }
        });

        clusters.set(nodeOne.id, cluster);
      }
    });

    this.clusters = clusters;

    this.trigger(clusters);
  },

  getInitialState: function() {
    return this.clusters;
  }
});