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
    var placeClips = [];

    this.state.nodes.forEach(function(node, key) {
      placeClips.push(<PlaceClip key={key} node={node} />);
    });

    return <g className="place-clip-list">{placeClips}</g>;
  }
});