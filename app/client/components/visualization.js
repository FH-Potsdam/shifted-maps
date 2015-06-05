var Reflux = require('reflux'),
  React = require('react'),
  Defs = require('./defs'),
  Network = require('./network'),
  mapStore = require('../stores/map');

module.exports = React.createClass({
  mixins: [Reflux.connect(mapStore)],

  render: function() {
    if (this.state.map == null)
      return null;

    var map = this.state.map,
      size = map.getSize();

    return (
      <svg ref="svg" width={size.x} height={size.y}>
        <Defs />
        <Network />
      </svg>
    );
  }
});