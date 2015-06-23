var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  placesStore = require('./places'),
  Node = require('../models/node'),
  VisActions = require('../actions/vis'),
  config = require('../config');

var RADIUS_SCALE = config.place_radius_scale.copy(),
  STROKE_WIDTH_SCALE = config.place_stroke_width_scale.copy();

function calcDist(nodeOne, nodeTwo){
  return Math.sqrt(Math.pow(nodeTwo.point.x - nodeOne.point.x, 2) + Math.pow(nodeTwo.point.y - nodeOne.point.y, 2));
}

module.exports = Reflux.createStore({
  init: function() {
    this.nodes = Immutable.OrderedMap();

    this.places = null;
    this.positionMapper = null;

    this.radiusScale = d3.scale.pow().exponent(.5);
    this.strokeWidthScale = d3.scale.pow().exponent(.5);

    this.listenTo(placesStore, this.setPlaces);
    this.listenTo(VisActions.update, this.onUpdateVis);
  },

  setPlaces: function(places) {
    var minDuration = Infinity,
      maxDuration = -Infinity,
      minFrequency = Infinity,
      maxFrequency = -Infinity;

    places.forEach(function(place) {
      var duration = place.duration,
        frequency = place.stays.size;

      minDuration = Math.min(minDuration, duration);
      maxDuration = Math.max(maxDuration, duration);
      minFrequency = Math.min(minFrequency, frequency);
      maxFrequency = Math.max(maxFrequency, frequency);
    });

    this.radiusScale.domain([minDuration, maxDuration]);
    this.strokeWidthScale.domain([minFrequency, maxFrequency]);
    this.places = places;

    this.updateNodes();
  },

  onUpdateVis: function(scale, positionMapper) {
    this.radiusScale.range(RADIUS_SCALE(scale));
    this.strokeWidthScale.range(STROKE_WIDTH_SCALE(scale));
    this.positionMapper = positionMapper;

    this.updateNodes();
  },

  updateNodes: function() {
    var places = this.places,
      positionMapper = this.positionMapper,
      radiusScale = this.radiusScale,
      strokeWidthScale = this.strokeWidthScale;

    if (places == null || positionMapper == null)
      return;

    this.nodes = places
      .map(function(place) {
        return new Node({
          id: place.id,
          place: place,
          radius: radiusScale(place.duration),
          strokeWidth: strokeWidthScale(place.stays.size),
          point: positionMapper(place)
        });
      })
      .toOrderedMap()
      .sortBy(function(node) {
        return -node.radius;
      });

    this.trigger(this.nodes);
  },

  getInitialState: function() {
    return this.nodes;
  }
});