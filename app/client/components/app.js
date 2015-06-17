var Reflux = require('reflux'),
  React = require('react'),
  InitAction = require('../actions/init'),
  Map = require('./map'),
  Vis = require('./vis'),
  config = require('../config');

module.exports = React.createClass({
  componentDidMount: function() {
    InitAction();
  },

  render: function() {
    return (
      <Map id={this.state.mapId} zoom={this.state.mapZoom} center={this.state.mapCenter} className="map">
        <Vis className="leaflet-zoom-animated" />
      </Map>
    );
  },

  getInitialState: function() {
    return {
      mapId: config.mapbox.id,
      mapZoom: 19,
      mapCenter: [52.475920, 13.430980]
    };
  }
});