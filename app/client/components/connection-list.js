var Reflux = require('reflux'),
  React = require('react'),
  connectionsStore = require('../stores/connections'),
  Connection = require('./connection');

module.exports = React.createClass({
  mixins: [Reflux.connect(connectionsStore, 'connections')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.connections !== nextState.connections;
  },

  render: function() {
    return (
      <g className="connection-list">
        {this.state.connections.map(function(connection, key) {
          return <Connection key={key} connection={connection} />;
        })}
      </g>
    );
  }
});