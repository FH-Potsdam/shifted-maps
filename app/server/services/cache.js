var CacheMongo = require('cacheman-mongo'),
  Cache = require('cacheman'),
  _ = require('lodash'),
  mongoose = require('./mongoose');

var engine = new CacheMongo({ connection: mongoose.connection });

function cache(name, options) {
  options = _.extend({
    engine: engine
  }, options || {});

  return new Cache(name, options);
}

module.exports = cache;