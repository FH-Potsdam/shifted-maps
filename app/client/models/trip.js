var Backbone = require('backbone');

var Trip = Backbone.RelationalModel.extend({
  idAttribute: '_id'
});

Trip.Collection = Backbone.Collection.extend({
  model: Trip,
  url: '/api/user/trips'
});

module.exports = Trip;