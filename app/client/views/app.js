var Backbone = require('backbone');

var MapView = require('./map'),
  VisView = require('./vis');

var AppView = Backbone.View.extend({
  initialize: function() {
    this.render();
  },

  render: function() {
    var mapView = new MapView({ el: '#map' });

    mapView.map._initPathRoot();

    new VisView({
      el: mapView.map.getPanes().overlayPane
    });

    return this;
  }
});

module.exports = AppView;