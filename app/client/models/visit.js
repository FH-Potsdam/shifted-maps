var Backbone = require('backbone');

var Visit = Backbone.RelationalModel.extend({
  idAttribute: '_id'
});

Visit.Collection = Backbone.Collection.extend({
  model: Visit,
  url: '/api/user/visits'
});

module.exports = Visit;