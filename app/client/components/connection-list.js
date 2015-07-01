var Reflux = require('reflux'),
  React = require('react'),
  edgesStore = require('../stores/edges'),
  edgeClustersStore = require('../stores/edge-clusters'),
  Connection = require('./connection');

module.exports = React.createClass({
  mixins: [Reflux.connect(edgeClustersStore, 'edges')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.edges !== nextState.edges;
  },

  render: function() {
    var connections = [];

    this.state.edges.forEach(function(edge, key) {
      connections.push(<Connection key={key} edge={edge} />);
    });

    return <g className="connection-list">{connections}</g>;
  }
});