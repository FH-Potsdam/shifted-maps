var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  placesStore = require('./places'),
  visStore = require('./vis'),
  Node = require('../models/node'),
  Point = require('../models/point');

function calcDist(nodeOne, nodeTwo){
  return Math.sqrt(Math.pow(nodeTwo.point.x - nodeOne.point.x, 2) + Math.pow(nodeTwo.point.y - nodeOne.point.y, 2));
}

var RADIUS_SCALE = d3.scale.linear().range([[20, 75], [75, 250]]),
  STROKE_WIDTH_SCALE = d3.scale.linear().range([[1, 3], [3, 10]]);

module.exports = Reflux.createStore({
  init: function() {
    this.nodes = Immutable.OrderedMap();

    this.places = null;
    this.map = null;
    this.lastScale = null;

    this.radiusScale = d3.scale.pow().exponent(.25);
    this.strokeWidthScale = d3.scale.pow().exponent(.5);

    this.listenTo(placesStore, this.setPlaces);
    this.listenTo(visStore, this.onVisChange);
  },

  setPlaces: function(places) {
    var map = this.map;

    this.places = places;

    if (map == null)
      return;

    var minDuration = Infinity,
      maxDuration = -Infinity,
      minFrequency = Infinity,
      maxFrequency = -Infinity;

    places.forEach(function(place) {
      var frequency = place.stays.size;

      minDuration = Math.min(minDuration, place.duration);
      maxDuration = Math.max(maxDuration, place.duration);
      minFrequency = Math.min(minFrequency, frequency);
      maxFrequency = Math.max(maxFrequency, frequency);
    });

    var radiusScale = this.radiusScale.domain([minDuration, maxDuration]),
      strokeWidthScale = this.strokeWidthScale.domain([minFrequency, maxFrequency]);

    this.nodes = places
      .map(function(place) {
        return new Node({
          id: place.id,
          place: place,
          radius: radiusScale(place.duration),
          strokeWidth: strokeWidthScale(place.stays.size),
          point: new Point(map.latLngToLayerPoint(place.location))
        });
      })
      .toOrderedMap()
      .sortBy(function(node) {
        return -node.radius;
      });

    this.trigger(this.nodes);
  },

  setMap: function(map) {
    this.map = map;

    if (this.places == null)
      return;

    this.setPlaces(this.places);
  },

  onVisChange: function(vis) {
    var scale = vis.get('scale');

    if (scale !== this.lastScale) {
      this.radiusScale.range(RADIUS_SCALE(scale));
      this.strokeWidthScale.range(STROKE_WIDTH_SCALE(scale));

      this.lastScale = scale;
    }

    this.setMap(vis.get('map'));
  },

  getInitialState: function() {
    return this.nodes;
  }
});