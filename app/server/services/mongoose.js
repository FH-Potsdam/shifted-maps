var mongoose = require('mongoose'),
  config = require('../config');

mongoose.connect(config.mongodb.uri, config.mongodb.options);

module.exports = mongoose;