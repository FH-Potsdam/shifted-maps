var Reflux = require('reflux'),
  InitActions = require('../actions/init'),
  mapStore = require('../stores/map'),
  immutable = require('immutable'),
  d3 = require('d3'),
  norm = require('mout/math/norm');

var RADIUS_SCALE = d3.scale.sqrt().domain([0, 1]).range([20, 50]);

module.exports = Reflux.createStore({
  init: function() {
    this.places = immutable.OrderedMap();

    this.listenTo(InitActions.addPlace, this.addPlace);
    this.listenTo(InitActions.addStay, this.addStay);
  },

  addPlace: function(place) {
    this.places = this.places.set(place.id, place);
  },

  addStay: function(stay) {
    var place = this.places.get(stay.at);

    if (place == null)
      return;

    var stays = place.stays.push(stay),
      duration = stays.reduce(function(duration, stay) {
        return duration + stay.duration;
      }, stays.first().duration);

    // Calc min and max and take into account new duration of current place
    var places = this.places.remove(place.id),
      relativeDuration = 1;

    if (places.size > 0) {
      var minDuration = places.toKeyedSeq()
          .filter(function(place) { return place.duration > 0; })
          .minBy(function(place) { return place.duration }).duration,
        maxDuration = places.maxBy(function(place) { return place.duration }).duration;

      minDuration = Math.min(minDuration, duration);
      maxDuration = Math.max(maxDuration, duration);

      relativeDuration = norm(duration, minDuration, maxDuration);
    }

    place = place.merge({
      stays: stays,
      duration: duration,
      radius: RADIUS_SCALE(relativeDuration)
    });

    this.places = this.places.set(place.id, place);

    this.trigger(this.places.filter(function(place) {
      return place.duration > 0;
    }));
  },

  getInitialState: function() {
    return this.places;
  }
});