var mongoose = require('../services/mongoose'),
  moment = require('moment'),
  _ = require('lodash'),
  assert = require('assert');

var UserSchema = new mongoose.Schema({
  _id: Number,
  accessToken: {type: String, select: false, required: true},
  tokenExpiresAt: {type: Date, select: false, required: true},
  refreshToken: {type: String, select: false, required: true},
  lastVisitAt: {type: Date, 'default': Date.now, required: true},
  lastUpdateAt: Date,
  fetched: {type: Boolean, 'default': false},
  firstDate: {type: Date, required: true}
});

UserSchema.virtual('tokenExpiresIn').get(function() {
  return moment().diff(this.tokenExpiresAt, 's');
});

UserSchema.virtual('tokenExpiresIn').set(function(expiresIn) {
  this.tokenExpiresAt = moment().add(expiresIn, 's').toDate();
});

module.exports = mongoose.model('User', UserSchema);