var Reflux = require('Reflux'),
  oboe = require('oboe'),
  moment = require('moment'),
  Place = require('../models/place'),
  Stay = require('../models/stay'),
  Trip = require('../models/trip');

var initAction = Reflux.createAction({
  asyncResult: true,
  children: ['addPlace', 'addStay', 'addTrip']
});

initAction.listen(function() {
  oboe('/api')
    .node('startAt', function(startAt) {
      return new Date(startAt * 1000);
    })
    .node('endAt', function(endAt) {
      return new Date(endAt * 1000);
    })
    .node('location', function(location) {
      return L.latLng(location.lat, location.lon);
    })
    .node('place', function(place) {
      initAction.addPlace(new Place(place));
    })
    .node('stay', function(stay) {
      stay.duration = moment(stay.endAt).diff(stay.startAt, 's');
      initAction.addStay(new Stay(stay));
    })
    .node('trip', function(trip) {
      initAction.addTrip(new Trip(trip));
    })
    .done(initAction.completed)
    .fail(initAction.failed);
});

module.exports = initAction;