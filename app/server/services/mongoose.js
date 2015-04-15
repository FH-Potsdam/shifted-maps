var mongoose = require('mongoose'),
  config = require('../config');

mongoose.connect(config.mongodb.uri);

module.exports = mongoose;