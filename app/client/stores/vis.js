var Reflux = require('reflux'),
  Immutable = require('immutable'),
  Bounds = require('../models/bounds'),
  Point = require('../models/point'),
  MapActions = require('../actions/map');

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

    this.listenToMany(MapActions);
  },

  onViewReset: function(map) {
    this.trigger(this.updateMap(map));
  },

  onMoveEnd: function(map) {
    this.trigger(this.updateMap(map));
  },

  onZoomAnim: function(map, event) {
    var scale = map.getZoomScale(event.zoom),
      boundsMin = this.state.get('bounds').min,
      translate = map._getCenterOffset(event.center)._multiplyBy(-scale)._add(boundsMin.toObject());

    this.updateMap(map);

    this.state = this.state.set('transform', Immutable.Map({
      translate: immutablePoint(translate),
      scale: scale
    }));

    this.trigger(this.state);
  },

  updateMap: function(map) {
    var bounds = calculateBounds(map);

    this.state = this.state.merge({
      map: map,
      bounds: immutableBounds(bounds),
      transform: Immutable.Map({ translate: immutablePoint(bounds.min) })
    });

    return this.state;
  },

  getInitialState: function() {
    return this.state;
  }
});