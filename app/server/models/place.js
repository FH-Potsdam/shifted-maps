var mongoose = require('../services/mongoose'),
  _ = require('lodash'),
  moment = require('moment');

var visitSchema = new Schema({
  startAt: Date,
  endAt: Date
});

visitSchema.virtual('duration').get(function() {
  return moment(this.startAt).diff(this.endAt, 's');
});

var placeSchema = new mongoose.Schema({
  _id: Number,
  location: { type: [Number], index: '2d' },
  title: String,
  visits: [visitSchema]
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

module.exports = mongoose.model('Place', placeSchema);