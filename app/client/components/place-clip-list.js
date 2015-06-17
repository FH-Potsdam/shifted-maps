var Reflux = require('reflux'),
  React = require('react'),
  nodesStore = require('../stores/nodes'),
  PlaceClip = require('./place-clip');

module.exports = React.createClass({
  mixins: [Reflux.connect(nodesStore, 'nodes')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.nodes !== nextState.nodes;
  },

  render: function() {
    return (
      <g className="place-clip-list">
        {this.state.nodes.map(function(node, key) {
          return <PlaceClip key={key} node={node} />;
        })}
      </g>
    );
  }
});