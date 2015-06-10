var Reflux = require('reflux'),
  React = require('react'),
  connectionShapeStore = require('../stores/connection-shapes'),
  Connection = require('./connection');

module.exports = React.createClass({
  mixins: [Reflux.connect(connectionShapeStore, 'connectionShapes')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.connectionShapes !== nextState.connectionShapes;
  },

  render: function() {
    return (
      <g className="connection-list">
        {this.state.connectionShapes.map(function(connectionShape, key) {
          return <Connection key={key} connectionShape={connectionShape} />;
        })}
      </g>
    );
  }
});