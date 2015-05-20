var Backbone = require('backbone'),
  Trip = require('./trip'),
  map = require('mout/math/map'),
  norm = require('mout/math/norm');

var Connection = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [{
    type: 'HasMany',
    key: '_trips',
    relatedModel: Trip,
    collectionType: Trip.Collection,
    reverseRelation: {
      key: '_connection'
    }
  }]/*,

  initialize: function() {
    this.on('change:_trips', this.tripsChanged);
    this.listenTo(this.collection, 'sync', this.update);
  },

  tripsChanged: function() {
    console.log('tripsChanged');

    this.set({
      frequency: this._trips.length,
      duration: this._trips.sum(function(trip) {
        return trip.get('duration')
      }) / this._trips.length
    })
  },

  update: function(collection) {
    console.log('sync', collection.length);

    var frequency = this.get('frequency'),
      duration = this.get('duration');

    this.set({
      relativeFrequency: norm(frequency, this.collection._minFrequency, this.collection._maxFrequency),
      durationBeeline: map(duration,
        this.collection._minDuration, this.collection._maxDuration,
        this.collection._minBeeline, this.collection._maxBeeline),
      frequencyBeeline: map(frequency,
        this.collection._minDuration, this.collection._maxDuration,
        this.collection._maxBeeline, this.collection._minBeeline)
    })
  }*/
});

Connection.Collection = Backbone.Collection.extend({
  model: Connection,
  url: '/api/user/connections'/*,

  initialize: function() {
    this.on('update', this.update);
  },

  update: function() {
    this._minDuration = this._minFrequency = this._minBeeline = Infinity;
    this._maxDuration = this._maxFrequency = this._maxBeeline = -Infinity;

    this.forEach(function(connection) {
      var duration = connection.get('duration'),
        frequency = connection.get('frequency'),
        beeline = connection.get('beeline');

      this._minDuration = Math.min(this._minDuration, duration);
      this._maxDuration = Math.max(this._maxDuration, duration);
      this._minFrequency = Math.min(this._minFrequency, frequency);
      this._maxFrequency = Math.max(this._maxFrequency, frequency);
      if (beeline > 0 && beeline < Infinity)
        this._minBeeline = Math.min(this._minBeeline, beeline);
      this._maxBeeline = Math.max(this._maxBeeline, beeline);
    }, this);

    return this;
  }*/
});

module.exports = Connection;