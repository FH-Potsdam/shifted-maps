var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  placesStore = require('./places'),
  scalesStore = require('./scales'),
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

    this.scale = null;
    this.positionMapper = null;

    this.radiusScale = d3.scale.pow().exponent(.5);
    this.strokeWidthScale = d3.scale.pow().exponent(.5);

    this.listenTo(placesStore, this.setPlaces);
    this.listenTo(scalesStore, this.setScales);
    this.listenTo(VisActions.update, this.onUpdateVis);

    this.scales = scalesStore.getInitialState();
    this.places = placesStore.getInitialState();
  },

  setPlaces: function(places) {
    this.places = places;

    this.updateScaleDomains();
  },

  setScales: function(scales) {
    this.scales = scales;

    this.updateScales();
  },

  onUpdateVis: function(scale, positionMapper) {
    this.scale = scale;
    this.positionMapper = positionMapper;

    this.updateScales();
  },

  updateScales: function() {
    if (this.scale == null)
      return;

    var radiusScale = this.scales.get('place-radius'),
      strokeWidthScale = this.scales.get('place-stroke-width');

    this.radiusScale.range(radiusScale(this.scale));
    this.strokeWidthScale.range(strokeWidthScale(this.scale));

    this.updateNodes();
  },

  updateScaleDomains: function() {
    var minDuration = Infinity,
      maxDuration = -Infinity,
      minFrequency = Infinity,
      maxFrequency = -Infinity;

    this.places.forEach(function(place) {
      var duration = place.duration,
        frequency = place.stays.size;

      minDuration = Math.min(minDuration, duration);
      maxDuration = Math.max(maxDuration, duration);
      minFrequency = Math.min(minFrequency, frequency);
      maxFrequency = Math.max(maxFrequency, frequency);
    });

    this.radiusScale.domain([minDuration, maxDuration]);
    this.strokeWidthScale.domain([minFrequency, maxFrequency]);

    this.updateNodes();
  },

  updateNodes: function() {
    var positionMapper = this.positionMapper,
      radiusScale = this.radiusScale,
      strokeWidthScale = this.strokeWidthScale;

    if (positionMapper == null || this.scale == null)
      return;

    this.nodes = this.places
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