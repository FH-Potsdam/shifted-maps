var CacheMongo = require('cacheman-mongo'),
  Cache = require('cacheman'),
  extend = require('lodash/object/extend'),
  mongoose = require('./mongoose');

var engine = new CacheMongo(mongoose.connection);

function cache(name, options) {
  options = extend({
    engine: engine
  }, options || {});

  return new Cache(name, options);
}

module.exports = cache;