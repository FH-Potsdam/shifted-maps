var mongoose = require('../services/mongoose'),
  moment = require('moment');

var ActivitySchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  distance: { type: Number, required: true },
  steps: { type: Number, select: false },
  group: { type: String, select: false },
  type: { type: String, required: true, select: false }
});

var TripSchema = new mongoose.Schema({
  _user: { type: Number, ref: 'User', required: true, index: true },
  _connection: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true, index: true },
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true, index: true },
  activities: [ActivitySchema]
});

TripSchema.path('startAt').validate(function() {
  return moment(this.startAt).isBefore(this.endAt);
}, 'startAt must be before endAt');

TripSchema.virtual('duration').get(function() {
  return moment(this.endAt).diff(this.startAt, 's');
});

TripSchema.set('toJSON', {
  getters: true,
  versionKey: false,
  depopulate: true,
  transform: function(connection, ret) {
    delete ret._user;
    delete ret.activities;
  }
});

module.exports = mongoose.model('Trip', TripSchema);