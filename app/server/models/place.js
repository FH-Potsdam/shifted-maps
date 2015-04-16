var mongoose = require('../services/mongoose'),
  _ = require('lodash'),
  geolib = require('geolib'),
  moment = require('moment');

var visitSchema = new mongoose.Schema({
  startAt: Date,
  endAt: Date,
  __v: { type: Number, select: false }
});

visitSchema.virtual('duration').get(function() {
  return moment(this.endAt).diff(this.startAt, 's');
});

var placeSchema = new mongoose.Schema({
  _id: Number,
  location: {
    type: [Number],
    index: '2d',
    required: true,
    get: function(location) {
      return { longitude: location[0], latitude: location[1] };
    },
    set: function(location) {
      return [geolib.longitude(location), geolib.latitude(location)];
    }
  },
  name: String,
  visits: { type: [visitSchema], select: false },
  __v: { type: Number, select: false }
});

placeSchema.virtual('firstVisitAt').get(function() {
  return _.min(this.visits, 'startAt').startAt;
});

placeSchema.virtual('lastVisitAt').get(function() {
  return _.max(this.visits, 'endAt').endAt;
});

placeSchema.virtual('duration').get(function() {
  return _.chain(this.visits).map('duration').sum().value();
});

placeSchema.virtual('frequency').get(function() {
  return this.visits.length;
});


module.exports = mongoose.model('Place', placeSchema);