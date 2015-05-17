var Backbone = require('backbone'),
  norm = require('mout/math/norm');

var Place = Backbone.Model.extend({
  idAttribute: '_id',

  initialize: function() {
    this.listenTo(this.collection, 'update', this.update);
  },

  update: function() {
    this.set({
      relativeDuration: norm(this.get('duration'), this.collection._minDuration, this.collection._maxDuration),
      relativeFrequency: norm(this.get('frequency'), this.collection._minFrequency, this.collection._maxFrequency)
    })
  }
});

Place.Collection = Backbone.Collection.extend({
  model: Place,
  url: '/api/user/places',

  initialize: function() {
    this.on('update', this.update);
  },

  update: function() {
    this._minDuration = this._minFrequency = Infinity;
    this._maxDuration = this._maxFrequency = -Infinity;

    this.forEach(function(place) {
      var duration = place.get('duration'),
        frequency = place.get('frequency');

      this._minDuration = Math.min(this._minDuration, duration);
      this._maxDuration = Math.max(this._maxDuration, duration);
      this._minFrequency = Math.min(this._minFrequency, frequency);
      this._maxFrequency = Math.max(this._maxFrequency, frequency);
    }, this);

    return this;
  }
});

module.exports = Place;