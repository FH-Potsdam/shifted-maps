var mongoose = require('../services/mongoose'),
  _ = require('lodash'),
  geolib = require('geolib'),
  moment = require('moment');

var VisitSchema = new mongoose.Schema({
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true }
});

VisitSchema.virtual('duration').get(function() {
  return moment(this.endAt).diff(this.startAt, 's');
});

VisitSchema.path('startAt').validate(function(value) {
  return moment(value).isBefore(this.endAt);
}, 'startAt must be before endAt');

var PlaceSchema = new mongoose.Schema({
  _id: Number,
  _user: { type: Number, ref: 'User', required: true, index: true, select: false },
  location: {
    type: mongoose.Schema.Types.Mixed,
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
  visits: [VisitSchema],
  type: { type: String, required: true }
});

PlaceSchema.set('toJSON', {
  getters: true,
  versionKey: false,
  transform: function(connection, ret) {
    delete ret.visits;
    delete ret.id;
  }
});

PlaceSchema.pre('validate', function(place, next) {
  place.visits = _.sortBy(place.visits, 'startAt');
  next();
});

PlaceSchema.path('visits').validate(function(visits) {
  if (visits.length == 0) {
    return true;
  }

  var lastVisit = visits[0];

  return _.every(_.drop(visits), function(visit) {
    if (lastVisit.endAt > visit.startAt) {
      return false;
    }

    lastVisit = visit;

    return true;
  });
}, 'Visits are not allowed to overlap.');

PlaceSchema.virtual('duration').get(function() {
  return _.chain(this.visits).map('duration').sum().value();
});

PlaceSchema.virtual('frequency').get(function() {
  return this.visits.length;
});

/*PlaceSchema.statics.findByUser = function(user, callback) {
  return this.find(callback).where('id', user.places)
};*/

module.exports = mongoose.model('Place', PlaceSchema);