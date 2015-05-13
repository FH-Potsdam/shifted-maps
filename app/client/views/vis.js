var Backbone = require('backbone'),
  d3 = require('d3');

var VisView = Backbone.View.extend({
  initialize: function() {
    this.render();
  },

  render: function() {
    d3.select(this.el).select('svg');

    return this;
  }
});

module.exports = VisView;