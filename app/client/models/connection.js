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
  }]
});

Connection.Collection = Backbone.Collection.extend({
  model: Connection,
  url: '/api/user/connections'
});

module.exports = Connection;