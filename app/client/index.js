var jQuery = require('jquery'),
  Backbone = require('backbone'),
  config = require('./config');

var Router = require("./router");

Backbone.$ = jQuery;
L.mapbox.accessToken = config.mapbox.token;

new Router();
Backbone.history.start({ pushState: true });