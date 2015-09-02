var Reflux = require('reflux'),
  React = require('react'),
  InitAction = require('../actions/init'),
  Map = require('./map'),
  Vis = require('./vis'),
  //Ui = require('./ui'),
  config = require('../config');

module.exports = React.createClass({
  componentDidMount: function() {
    InitAction();
  },

  render: function() {
    return (
      <div className="app">
        <Map id={this.state.mapId} zoom={this.state.mapZoom} center={this.state.mapCenter} className="app-map">
          <Vis className="leaflet-zoom-animated" />
        </Map>
        {/*<Ui />*/}
      </div>
    );
  },

  getInitialState: function() {
    return {
      mapId: config.mapbox.id,
      mapZoom: 10,
      mapCenter: [52.520007, 13.404954]
    };
  }
});