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
    var placeCircles = [];

    this.state.nodes.forEach(function(node, key) {
      placeCircles.push(<PlaceCircle key={key} node={node} />);
    });

    return <g className="place-circle-list">{placeCircles}</g>;
  }
});