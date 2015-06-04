var Reflux = require('reflux'),
  init = require('../actions/init'),
  immutable = require('immutable');

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(init.addPlace, this.onAddPlace);
  },

  onAddPlace: function(place) {
    this._places = this._places.set(place.id, place);

    this.trigger(this._places);
  },

  getInitialState: function() {
    this._places = immutable.OrderedMap();

    return this._places;
  }
});