var Reflux = require('reflux'),
  Immutable = require('immutable'),
  debounce = require('mout/function/debounce'),
  InitActions = require('../actions/init');

var placesStore = module.exports = Reflux.createStore({
  init: function() {
    this.map = null;
    this.places = Immutable.Map();

    this.minDurationPlace = null;
    this.maxDurationPlace = null;

    this.listenTo(InitActions.addPlace, this.addPlace);
    this.listenTo(InitActions.addStay, this.addStay);
  },

  addPlace: function(place) {
    this.places = this.places.set(place.id, place);

    this.trigger(this.places);
  },

  addStay: function(stay) {
    var place = this.places.get(stay.at);

    if (place == null)
      return console.error('Missing place: ' + stay.at);

    place = place.merge({
      stays: place.stays.push(stay),
      duration: place.duration + stay.duration
    });

    this.places = this.places.set(place.id, place);

    this.trigger(this.places);
  },

  getInitialState: function() {
    return this.places;
  }
});

placesStore.trigger = debounce(placesStore.trigger, 5);