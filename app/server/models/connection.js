var mongoose = require('../services/mongoose'),
  moment = require('moment'),
  _ = require('lodash');

var ActivitySchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  distance: { type: Number, required: true },
  steps: { type: Number, select: false },
  group: { type: String, select: false },
  type: { type: String, required: true, select: false }
});

var TripSchema = new mongoose.Schema({
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  activities: [ActivitySchema]
});

TripSchema.path('startAt').validate(function() {
  return moment(this.startAt).isBefore(this.endAt);
}, 'startAt must be before endAt');

TripSchema.virtual('distance').get(function() {
  return _.sum(this.activities, 'distance');
});

TripSchema.virtual('duration').get(function() {
  return moment(this.endAt).diff(this.startAt, 's');
});

var ConnectionSchema = new mongoose.Schema({
  _from: { type: Number, ref: 'Place', required: true, index: true },
  _to: { type: Number, ref: 'Place', required: true, index: true },
  _user: { type: Number, ref: 'User', required: true, index: true, select: false },
  trips: [TripSchema]
});

ConnectionSchema.set('toJSON', {
  getters: true,
  versionKey: false,
  transform: function(connection, ret) {
    delete ret.trips;
    delete ret.id;
  }
});

ConnectionSchema.pre('validate', function(connection, next) {
  connection.trips = _.sortBy(connection.trips, 'startAt');
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

ConnectionSchema.virtual('distance').get(function() {
  return Math.round(_.sum(this.trips, 'distance') / this.frequency);
});

ConnectionSchema.virtual('duration').get(function() {
  return Math.round(_.sum(this.trips, 'duration') / this.frequency);
});

module.exports = mongoose.model('Connection', ConnectionSchema);