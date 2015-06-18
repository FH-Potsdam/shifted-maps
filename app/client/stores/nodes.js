var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  placesStore = require('./places'),
  Node = require('../models/node'),
  VisActions = require('../actions/vis');

function calcDist(nodeOne, nodeTwo){
  return Math.sqrt(Math.pow(nodeTwo.point.x - nodeOne.point.x, 2) + Math.pow(nodeTwo.point.y - nodeOne.point.y, 2));
}

var RADIUS_SCALE = d3.scale.linear().range([[20, 75], [75, 250]]),
  STROKE_WIDTH_SCALE = d3.scale.linear().range([[1, 10], [3, 30]]),
  ZOOM_SCALE = d3.scale.linear().range([[14, 16], [16, 18]]);

module.exports = Reflux.createStore({
  init: function() {
    this.nodes = Immutable.OrderedMap();

    this.places = null;
    this.positionMapper = null;

    this.radiusScale = d3.scale.pow().exponent(.25);
    this.strokeWidthScale = d3.scale.pow().exponent(.5);
    this.zoomScale = d3.scale.pow().exponent(.25);

    this.listenTo(placesStore, this.setPlaces);
    this.listenTo(VisActions.update, this.onUpdateVis);
  },

  setPlaces: function(places) {
    var positionMapper = this.positionMapper;

    this.places = places;

    if (positionMapper == null)
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
      zoomScale = this.zoomScale.domain([minDuration, maxDuration]),
      strokeWidthScale = this.strokeWidthScale.domain([minFrequency, maxFrequency]);

    this.nodes = places
      .map(function(place) {
        return new Node({
          id: place.id,
          place: place,
          radius: radiusScale(place.duration),
          strokeWidth: strokeWidthScale(place.stays.size),
          point: positionMapper(place),
          zoom: Math.round(zoomScale(place.duration))
        });
      })
      .toOrderedMap()
      .sortBy(function(node) {
        return -node.radius;
      });

    this.trigger(this.nodes);
  },

  onUpdateVis: function(scale, positionMapper) {
    this.positionMapper = positionMapper;

    this.radiusScale.range(RADIUS_SCALE(scale));
    this.strokeWidthScale.range(STROKE_WIDTH_SCALE(scale));
    this.zoomScale.range(ZOOM_SCALE(scale));

    if (this.places == null)
      return;

    this.setPlaces(this.places);
  },

  getInitialState: function() {
    return this.nodes;
  }
});