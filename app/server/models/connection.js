var mongoose = require('../services/mongoose'),
  moment = require('moment'),
  _ = require('lodash'),
  geolib = require('geolib'),
  autopopulate = require('mongoose-autopopulate'),
  Place = require('./place');

var ActivitySchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  distance: { type: Number, required: true },
  steps: { type: Number, select: false },
  group: { type: String, select: false },
  type: { type: String, required: true, select: false }
});

var TripSchema = new mongoose.Schema({
  direction: { type: Boolean, required: true, 'default': true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  activities: [ActivitySchema],
  distance: { type: Number, required: true }
});

TripSchema.path('startAt').validate(function() {
  return moment(this.startAt).isBefore(this.endAt);
}, 'startAt must be before endAt');

TripSchema.virtual('duration').get(function() {
  return moment(this.endAt).diff(this.startAt, 's');
});

var ConnectionSchema = new mongoose.Schema({
  _from: { type: Number, ref: 'Place', index: true, autopopulate: true },
  _to: { type: Number, ref: 'Place', index: true, autopopulate: true },
  _user: { type: Number, ref: 'User', required: true, index: true, autopopulate: true },
  trips: [TripSchema],
  beeline: { type: Number, required: true, 'default': Infinity },
  distance: { type: Number, required: true },
  duration: { type: Number, required: true }
}, { id: false });

ConnectionSchema.plugin(autopopulate);

ConnectionSchema.set('toJSON', {
  getters: true,
  versionKey: false,
  depopulate: true,
  transform: function(connection, ret) {
    delete ret.trips;
    delete ret._user;
  }
});

ConnectionSchema.pre('validate', function(next) {
  this.trips = _.sortBy(this.trips, 'startAt');

  this.trips.forEach(function(trip) {
    trip.distance = _.sum(trip.activities, 'distance');
  });

  this.distance = _.sum(this.trips, 'distance') / this.trips.length;
  this.duration = _.sum(this.trips, 'duration') / this.trips.length;

  this.beeline = (this._from != null && this._to != null) ?
    geolib.getDistance(this._from.location, this._to.location) : Infinity;

  next();
});

ConnectionSchema.path('trips').validate(function(trips) {
  var lastTrip = trips[0];

  return _.every(_.drop(trips), function(trip) {
    if (lastTrip.endAt > trip.startAt) {
      return false;
    }

    lastTrip = trip;

    return true;
  });
}, 'Trips are not allowed to overlap.');

ConnectionSchema.virtual('frequency').get(function() {
  return this.trips.length;
});

module.exports = mongoose.model('Connection', ConnectionSchema);