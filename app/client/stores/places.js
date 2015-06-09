var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  norm = require('mout/math/norm'),
  InitActions = require('../actions/init'),
  visStore = require('./vis');

var PLACE_RADIUS_SCALE = d3.scale.pow().exponent(.25).domain([0, 1]).range([10, 100]);

module.exports = Reflux.createStore({
  init: function() {
    this.map = null;
    this.places = Immutable.Map();

    this.listenTo(InitActions.addPlace, this.addPlace);
    this.listenTo(InitActions.addStay, this.addStay);
    this.listenTo(visStore, this.onVisChange);
  },

  addPlace: function(place) {
    var point;

    if (this.map != null) {
      point = this.map.latLngToLayerPoint(place.location);
      place =  place.set('point', { x: point.x, y: point.y });
    }

    this.places = this.places.set(place.id, place);

    // Do not trigger changes until map is set.
    if (point == null)
      return;

    this.trigger(this.places);
  },

  addStay: function(stay) {
    var place = this.places.get(stay.at);

    if (place == null)
      return console.error('Missing place: ' + stay.at);

    var stays = place.stays.push(stay),
      duration = stays.reduce(function(duration, stay) {
        return duration + stay.duration;
      }, stays.first().duration);

    // Calc min and max and take into account new duration of current place
    var places = this.places.remove(place.id),
      relativeDuration = 1;

    if (places.size > 0) {
      var minDuration = places.toKeyedSeq()
          .minBy(function(place) { return place.duration }).duration,
        maxDuration = places.maxBy(function(place) { return place.duration }).duration;

      minDuration = Math.min(minDuration, duration);
      maxDuration = Math.max(maxDuration, duration);

      relativeDuration = norm(duration, minDuration, maxDuration);
    }

    place = place.merge({
      stays: stays,
      duration: duration,
      relativeDuration: relativeDuration,
      radius: PLACE_RADIUS_SCALE(relativeDuration)
    });

    this.places = this.places.set(place.id, place);

    this.trigger(this.places);
  },

  onVisChange: function(vis) {
    var map = this.map = vis.get('map');

    this.places = this.places.map(function(place) {
      var point = map.latLngToLayerPoint(place.location);

      return place.set('point', { x: point.x, y: point.y });
    });

    this.trigger(this.places);
  },

  getInitialState: function() {
    return this.places;
  }
});