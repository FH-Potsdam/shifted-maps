var jQuery = require('jquery'),
  Backbone = require('backbone'),
  config = require('./config');

// Simply require backbone relational for being added to the compiled file
require('backbone-relational');

var Router = require("./router");

Backbone.$ = jQuery;
L.mapbox.accessToken = config.mapbox.token;

new Router();
Backbone.history.start({ pushState: true, root: '/map' });