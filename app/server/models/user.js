var mongoose = require('../services/mongoose'),
  moment = require('moment'),
  crypto = require('crypto'),
  _ = require('lodash');

var UserSchema = new mongoose.Schema({
  _id: Number,
  accessToken: { type: String, select: false, required: true },
  tokenExpiresAt: { type: Date, select: false, required: true },
  refreshToken: { type: String, select: false, required: true },
  lastVisitAt: { type: Date, 'default': Date.now, required: true },
  lastUpdateAt: Date,
  fetched: { type: Boolean, 'default': false },
  firstDate: { type: Date, required: true }
});

UserSchema.virtual('tokenExpiresIn').get(function() {
  return moment().diff(this.tokenExpiresAt, 's');
});

UserSchema.virtual('tokenExpiresIn').set(function(expiresIn) {
  this.tokenExpiresAt = moment().add(expiresIn, 's').toDate();
});

UserSchema.pre('remove', function(next) {
  this.removePlaces(next);
});

UserSchema.pre('remove', function(next) {
  this.removeConnections(next);
});

UserSchema.methods.findPlaces = function(done) {
  return this.model('Place').find({ _user: this }, done);
};

UserSchema.methods.findConnections = function(done) {
  return this.model('Connection').find({ _user: this }, done);
};

UserSchema.methods.removePlaces = function(done) {
  return this.model('Place').remove({ _user: this }, done);
};

UserSchema.methods.removeConnections = function(done) {
  return this.model('Connection').remove({ _user: this }, done);
};

module.exports = mongoose.model('User', UserSchema);