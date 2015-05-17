var mongoose = require('../services/mongoose'),
  geolib = require('geolib');

var ConnectionSchema = new mongoose.Schema({
  _from: { type: Number, ref: 'Place', index: true },
  _to: { type: Number, ref: 'Place', index: true },
  _user: { type: Number, ref: 'User', required: true, index: true },
  beeline: { type: Number, required: true, 'default': Infinity }
}, { id: false });

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
  this.beeline = (this._from != null && this._to != null) ?
    geolib.getDistance(this._from.location, this._to.location) : Infinity;

  next();
});

/*ConnectionSchema.path('trips').validate(function(trips) {
  var lastTrip = trips[0];

  return _.every(_.drop(trips), function(trip) {
    if (lastTrip.endAt > trip.startAt) {
      return false;
    }

    lastTrip = trip;

    return true;
  });
}, 'Trips are not allowed to overlap.');*/

module.exports = mongoose.model('Connection', ConnectionSchema);