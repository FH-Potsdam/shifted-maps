var mongoose = require('../services/mongoose'),
  moment = require('moment'),
  _ = require('lodash'),
  assert = require('assert'),
  Place = require('./place'),
  Connection = require('./connection'),
  Visit = require('./visit'),
  Trip = require('./trip');

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

UserSchema.methods.findPlaces = function(done) {
  return this.model('Place').find({_user: this}, done);
};

UserSchema.methods.findConnections = function(done) {
  return this.model('Connection').find({_user: this}, done);
};

UserSchema.methods.reset = function(done) {
  var user = this;

  return Place.remove({ _user: user }).exec()
    .then(function() {
      return Connection.remove({ _user: user }).exec();
    })
    .then(function() {
      return Visit.remove({ _user: user }).exec();
    })
    .then(function() {
      return Trip.remove({ _user: user }).exec();
    })
    .then(function() {
      user.fetched = false;
      user.lastUpdateAt = user.firstDate;

      return user.save();
    })
    .onResolve(done);
};

UserSchema.pre('remove', function(next) {
  this.reset(next);
});

UserSchema.methods.update = function(done) {
  this.fetched = true;
  this.lastUpdateAt = Date.now();

  return this.save(done);
};

module.exports = mongoose.model('User', UserSchema);