var Reflux = require('reflux'),
  React = require('react'),
  Immutable = require('immutable'),
  nodesStore = require('../stores/nodes'),
  clustersStore = require('../stores/clusters'),
  PlaceMap = require('./place-map'),
  PlaceDeco = require('./place-deco');

module.exports = React.createClass({
  mixins: [Reflux.connect(nodesStore, 'nodes'), Reflux.connect(clustersStore, 'clusters')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.nodes !== nextState.nodes || !Immutable.is(this.state.clusters, nextState.clusters);
  },

  render: function() {
    var places = [],
      clusters = this.state.clusters;

    this.state.nodes.forEach(function(node, key) {
      var primary = clusters.has(key),
        opacity = primary ? 1 : 0;

      places.push(
        <g key={key} className="place" opacity={opacity}>
          <PlaceMap node={node} primary={primary} />
          <PlaceDeco node={node} />
        </g>
      );
    });

    return <g className="place-list">{places}</g>;
  }
});