var mongoose = require('../services/mongoose'),
  moment = require('moment');

var VisitSchema = new mongoose.Schema({
  _user: { type: Number, ref: 'User', required: true, index: true },
  _place: { type: Number, ref: 'Place', required: true, index: true },
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true, index: true }
}, { id: false });

VisitSchema.virtual('duration').get(function() {
  return moment(this.endAt).diff(this.startAt, 's');
});

VisitSchema.path('startAt').validate(function(value) {
  return moment(value).isBefore(this.endAt);
}, 'startAt must be before endAt');

VisitSchema.set('toJSON', {
  getters: true,
  versionKey: false,
  depopulate: true,
  transform: function(connection, ret) {
    delete ret._user;
  }
});

module.exports = mongoose.model('Visit', VisitSchema);