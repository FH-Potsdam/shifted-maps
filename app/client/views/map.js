var Backbone = require("backbone"),
  config = require("../config");

var MapView = Backbone.View.extend({
  initialize: function(options) {
    this.options = options;

    this.render();
  },

  render: function() {
    this.map = L.mapbox.map(this.el, config.mapbox.id);

    return this;
  }
});

module.exports = MapView;