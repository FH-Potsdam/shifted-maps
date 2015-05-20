var Backbone = require('backbone'),
  debounce = require('mout/function/debounce'),
  _ = require('underscore'),
  Visit = require('./visit'),
  Connection = require('./connection');

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
  ]
});

Place.Collection = Backbone.Collection.extend({
  model: Place,
  url: '/api/user/places'
});

module.exports = Place;