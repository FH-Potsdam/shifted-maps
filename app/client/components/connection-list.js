var Reflux = require('reflux'),
  React = require('react'),
  edgeStore = require('../stores/edges'),
  Connection = require('./connection');

module.exports = React.createClass({
  mixins: [Reflux.connect(edgeStore, 'edges')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.edges !== nextState.edges;
  },

  render: function() {
    return (
      <g className="connection-list">
        {this.state.edges.map(function(edge, key) {
          return <Connection key={key} edge={edge} />;
        })}
      </g>
    );
  }
});