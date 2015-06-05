var Reflux = require('reflux'),
  MapActions = require('../actions/map'),
  immutable = require('immutable');

function getOneMeterInPixel(map) {
  var y = map.getSize().y / 2,
    distance = map.containerPointToLatLng([0, y])
      .distanceTo(map.containerPointToLatLng([100, y]));

  return 100 / distance;
}

function triggerMapEvent(map, event) {
  this.map = map;

  this.trigger({
    map: map,
    mapEvent: event
  });
}

module.exports = Reflux.createStore({
  init: function() {
    this.listenToMany(MapActions);
  },

  onViewReset: triggerMapEvent,
  onMoveStart: triggerMapEvent,
  onMoveEnd: triggerMapEvent,
  onZoomStart: triggerMapEvent,
  onZoomEnd: triggerMapEvent,

  getInitialState: function() {
    return { map: this.map };
  }
});