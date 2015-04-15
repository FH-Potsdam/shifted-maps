var Backbone = require("backbone");

var VisView = Backbone.View.extend({
  el: function() {

  },

  initialize: function() {
    this.render();
  },

  render: function() {
    return this;
  }
});

module.exports = VisView;