var Backbone = require("backbone"),
  AppView = require("./views/app");

var Router = Backbone.Router.extend({

  routes: {
    "": "index"
  },

  index: function() {
    new AppView({ el: '#app' });
  }

});

module.exports = Router;