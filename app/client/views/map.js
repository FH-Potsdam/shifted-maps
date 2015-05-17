var Backbone = require("backbone"),
  config = require("../config");

var MapView = Backbone.View.extend({
  initialize: function() {
    this.render();
  },

  render: function() {
    this._map = L.mapbox.map(this.el, config.mapbox.id).setView([52.520007, 13.404954], 5);
    this._map.addEventListener('zoomend', this.onMapEvent, this);

    // Initialize SVG root element
    this._map._initPathRoot();

    return this;
  },

  onMapEvent: function(event) {
    this.trigger(event.type, event);
  }
});

module.exports = MapView;