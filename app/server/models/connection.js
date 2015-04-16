var mongoose = require('../services/mongoose'),
  moment = require('moment'),
  geolib = require('geolib');

var connectionSchema = new mongoose.Schema({
  _from: { type: Number, ref: 'Place' },
  _to: { type: Number, ref: 'Place' },
  startAt: Date,
  endAt: Date,
  frequency: Number,
  __v: { type: Number, select: false }
});

connectionSchema.virtual('duration').get(function() {
  return moment(this.endDate).diff(this.startAt, 's');
});

connectionSchema.virtual('distance').get(function() {
  return geolib.getDistance(this._from.location, this._to.location);
});

module.exports = mongoose.model('Connection', connectionSchema);