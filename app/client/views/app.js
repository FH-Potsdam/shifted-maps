var Backbone = require('backbone');

var MapView = require('./map'),
  VisView = require('./vis'),
  State = require('../services/state');

var AppView = Backbone.View.extend({
  initialize: function() {
    this.render();
  },

  render: function() {
    this._mapView = new MapView({ el: '#map' });
    this._state = new State({ map: this._mapView._map });

    new VisView({
      state: this._state,
      mapView: this._mapView,
      el: this._mapView._map.getPanes().overlayPane
    });

    return this;
  }
});

module.exports = AppView;