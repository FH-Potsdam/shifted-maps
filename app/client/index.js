/*var jQuery = require('jquery'),
  Backbone = require('backbone'),
  config = require('./config');

var Router = require("./router");

Backbone.$ = jQuery;
L.mapbox.accessToken = config.mapbox.token;

new Router();
Backbone.history.start({ pushState: true });*/

var $ = require('jquery'),
  oboe = require('oboe');

var $test = $('#test');

console.log($test);

oboe('/map')
  .node('!.*', function(segment) {
    $test.append('<div>' + segment.place.name + '</div>');
  });