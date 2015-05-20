var Backbone = require('backbone'),
  debounce = require('mout/function/debounce'),
  _ = require('underscore'),
  Visit = require('./visit'),
  Connection = require('./connection')/*,
 norm = require('mout/math/norm')*/;

var Place = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [
    {
      type: 'HasMany',
      key: '_visits',
      relatedModel: Visit,
      collectionType: Visit.Collection,
      reverseRelation: {
        key: '_place'
      }
    },
    {
      type: 'HasMany',
      key: '_inbound',
      relatedModel: Connection,
      collectionType: Connection.Collection,
      reverseRelation: {
        key: '_to'
      }
    },
    {
      type: 'HasMany',
      key: '_outbound',
      relatedModel: Connection,
      collectionType: Connection.Collection,
      reverseRelation: {
        key: '_from'
      }
    }
  ],
  defaults: {
    duration: Infinity,
    frequency: Infinity,
    relativeDuration: Infinity,
    relativeFrequency: Infinity
  },

  initialize: function() {
    // @TODO Update should be triggered only once, so that we do not need debounce here.
    this.listenTo(this.get('_visits'), 'update', debounce(this.onVisitsUpdate, 10));
  },

  update: function() {
    this.set({
      relativeDuration: norm(this.get('duration'), this.collection._minDuration, this.collection._maxDuration),
      relativeFrequency: norm(this.get('frequency'), this.collection._minFrequency, this.collection._maxFrequency)
    });
  },

  onVisitsUpdate: function() {
    var visits = this.get('_visits'),
      duration;

    duration = _.reduce(visits.pluck('duration'), function(memo, num) {
      return memo + num;
    }, 0) / visits.length;

    this.set({
      duration: duration,
      frequency: visits.length
    });

    return this;
  }
});

Place.Collection = Backbone.Collection.extend({
  model: Place,
  url: '/api/user/places',
  comparator: 'duration',

  initialize: function() {
    this.on('change', debounce(this.onPlacesUpdate, 10));
  },

  onPlacesUpdate: function(model) {
    var changedAttributes = model.changedAttributes();

    if (changedAttributes.duration == null || changedAttributes.frequency == null)
      return this;

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

    console.log(this._minDuration, this._maxDuration, this._minFrequency, this._maxFrequency);

    return this;
  }
});

module.exports = Place;