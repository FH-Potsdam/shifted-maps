var Reflux = require('reflux'),
  React = require('react'),
  InitAction = require('../actions/init'),
  Map = require('./map'),
  Visualization = require('./visualization'),
  config = require('../config');

module.exports = React.createClass({
  componentDidMount: function() {
    InitAction();
  },

  render: function() {
    return (
      <Map id={this.state.mapId} zoom={this.state.mapZoom} center={this.state.mapCenter} className="map">
        <Visualization />
      </Map>
    );
  },

  getInitialState: function() {
    return {
      mapId: config.mapbox.id,
      mapZoom: 11,
      mapCenter: [52.520007, 13.404954]
    };
  }
});