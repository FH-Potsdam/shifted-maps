var mongoose = require('mongoose'),
  config = require('../config');

mongoose.Promise = global.Promise;

mongoose.connect(config.mongodb.uri, {
  ...config.mongodb.options,
  useMongoClient: true,
});

module.exports = mongoose;
