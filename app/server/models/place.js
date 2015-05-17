var mongoose = require('../services/mongoose'),
  geolib = require('geolib'),
  geocode = require('../services/geocode');

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
  type: { type: String, required: true }
}, { id: false });

PlaceSchema.set('toJSON', {
  getters: true,
  versionKey: false,
  depopulate: true,
  transform: function(place, ret) {
    delete ret.type;
  }
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

module.exports = mongoose.model('Place', PlaceSchema);