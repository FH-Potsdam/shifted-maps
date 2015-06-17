var Reflux = require('reflux'),
  React = require('react'),
  nodesStore = require('../stores/nodes'),
  PlaceCircle = require('./place-circle');

module.exports = React.createClass({
  mixins: [Reflux.connect(nodesStore, 'nodes')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.nodes !== nextState.nodes;
  },

  render: function() {
    return (
      <g className="place-circle-list">
        {this.state.nodes.map(function(node, key) {
          return <PlaceCircle key={key} node={node} />;
        })}
      </g>
    );
  }
});