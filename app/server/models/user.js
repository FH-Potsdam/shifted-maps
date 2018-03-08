var mongoose = require('../services/mongoose'),
  moment = require('moment'),
  _ = require('lodash');

var UserSchema = new mongoose.Schema({
  _id: Number,
  accessToken: { type: String, select: false, required: true },
  refreshToken: { type: String, select: false, required: true },
  lastVisitAt: { type: Date, default: Date.now, required: true },
  lastUpdateAt: Date,
  fetched: { type: Boolean, default: false },
  firstDate: { type: Date, required: true },
});

module.exports = mongoose.model('User', UserSchema);
