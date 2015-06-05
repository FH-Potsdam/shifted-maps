var Reflux = require('reflux'),
  React = require('react'),
  MapActions = require('../actions/map');

module.exports = React.createClass({
  componentDidMount: function() {
    var map = L.mapbox.map(React.findDOMNode(this.refs.map), this.props.id);

    function addListener(map, action) {
      map.on(action.toLowerCase(), function(event) {
        MapActions[action](map, event)
      });
    }

    for (var action in MapActions) {
      if (!MapActions.hasOwnProperty(action))
        continue;

      addListener(map, action);
    }

    map.setView(this.props.center, this.props.zoom);
    React.render(<div>{this.props.children}</div>, map.getPanes().overlayPane);
  },

  render: function() {
    return <div ref="map" className={this.props.className}></div>;
  }
});