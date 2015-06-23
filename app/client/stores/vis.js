var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  Bounds = require('../models/bounds'),
  Point = require('../models/point'),
  MapActions = require('../actions/map'),
  VisActions = require('../actions/vis');

var CLIP_PADDING = 0.5;

function calculateBounds(map) {
  var size = map.getSize(),
    min = map.containerPointToLayerPoint(size.multiplyBy(-CLIP_PADDING))

  return L.bounds(min, min.add(size.multiplyBy(1 + CLIP_PADDING * 2)));
}

function immutableBounds(bounds) {
  return new Bounds({
    min: immutablePoint(bounds.min),
    max: immutablePoint(bounds.max),
    dimensions: immutablePoint(bounds.getSize())
  });
}

function immutablePoint(point) {
  return new Point({ x: point.x, y: point.y });
}

module.exports = Reflux.createStore({
  init: function() {
    this.state = Immutable.Map();
    this.scale = d3.scale.linear();
    this.initilized = false;
    this.positionMapper = null;

    this.listenToMany(MapActions);
  },

  onInit: function(map) {
    this.positionMapper = function(place) {
      return new Point(map.latLngToLayerPoint(place.location));
    };

    this.scale.domain([map.getMinZoom(), map.getMaxZoom()]);
  },

  onViewReset: function(map) {
    var bounds = calculateBounds(map);

    this.state = this.state.merge({
      bounds: immutableBounds(bounds),
      transform: Immutable.Map({ translate: immutablePoint(bounds.min) })
    });

    VisActions.update(this.scale(map.getZoom()), this.positionMapper);

    this.trigger(this.state);
  },

  onMoveEnd: function(map) {
    var bounds = calculateBounds(map);

    this.state = this.state.merge({
      bounds: immutableBounds(bounds),
      transform: Immutable.Map({ translate: immutablePoint(bounds.min) })
    });

    this.trigger(this.state);
  },

  onZoomAnim: function(map, event) {
    var scale = map.getZoomScale(event.zoom),
      boundsMin = this.state.get('bounds').min,
      translate = map._getCenterOffset(event.center)._multiplyBy(-scale)._add(boundsMin.toObject());

    this.state = this.state.merge({
      transform: Immutable.Map({
        translate: immutablePoint(translate),
        scale: scale
      })
    });

    this.trigger(this.state);
  },

  getInitialState: function() {
    return this.state;
  }
});