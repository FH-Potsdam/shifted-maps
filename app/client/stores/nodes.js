var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  placesStore = require('./places'),
  Node = require('../models/node'),
  VisActions = require('../actions/vis'),
  config = require('../config');

function calcDist(nodeOne, nodeTwo){
  return Math.sqrt(Math.pow(nodeTwo.point.x - nodeOne.point.x, 2) + Math.pow(nodeTwo.point.y - nodeOne.point.y, 2));
}

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

    this.radiusScale.range(config.radius_scale(scale));
    this.strokeWidthScale.range(config.stroke_width_scale(scale));
    this.zoomScale.range(config.zoom_scale(scale));

    if (this.places == null)
      return;

    this.setPlaces(this.places);
  },

  getInitialState: function() {
    return this.nodes;
  }
});