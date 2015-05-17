var mongoose = require('../services/mongoose'),
  _ = require('lodash'),
  geolib = require('geolib'),
  moment = require('moment'),
  geocode = require('../services/geocode');

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
  _user: { type: Number, ref: 'User', required: true, index: true },
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
  type: { type: String, required: true },
  duration: { type: Number, required: true }
}, { id: false });

PlaceSchema.set('toJSON', {
  getters: true,
  versionKey: false,
  depopulate: true,
  transform: function(place, ret) {
    delete ret.visits;
    delete ret.type;
  }
});

PlaceSchema.pre('validate', function(next) {
  this.visits = _.sortBy(this.visits, 'startAt');
  this.duration = _.sum(this.visits, 'duration');

  next();
});

PlaceSchema.pre('save', function(next) {
  if (this.name == null) {
    var place = this;

    return geocode(this.location, function(error, name) {
      if (error)
        return next(error);

      place.name = name;
      place.type = 'geocode';
      next();
    });
  }

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

PlaceSchema.virtual('frequency').get(function() {
  return this.visits.length;
});

module.exports = mongoose.model('Place', PlaceSchema);