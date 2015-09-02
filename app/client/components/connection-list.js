var Reflux = require('reflux'),
  React = require('react'),
  edgesStore = require('../stores/edges'),
  clustersStore = require('../stores/clusters'),
  Connection = require('./connection');

module.exports = React.createClass({
  mixins: [
    Reflux.connect(edgesStore, 'edges'),
    Reflux.connect(clustersStore, 'clusters')
  ],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.edges !== nextState.edges;
  },

  render: function() {
    var clusters = this.state.clusters;

    var connections = this.state.edges.map(function(edge, key) {
      var primary = clusters.has(edge.from.id) || clusters.has(edge.to.id);

      return <Connection key={key} edge={edge} primary={primary} />;
    });

    return <g className="connection-list">{connections}</g>;
  }
});