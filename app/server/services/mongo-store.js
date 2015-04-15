var session = require('express-session'),
  mongoose = require('./mongoose'),
  MongoStore = require('connect-mongo')(session),
  config = require('../config');

var store = new MongoStore({
  mongooseConnection: mongoose.connection,
  ttl: config.session.store_ttl
});

module.exports = store;