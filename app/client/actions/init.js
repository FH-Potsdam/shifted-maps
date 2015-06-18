var Reflux = require('reflux'),
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
    /*.node('{startAt endAt}', function(object) {
      object.duration = moment(object.endAt).diff(object.startAt, 's');

      return object;
    })*/
    .node('place', function(place) {
      initAction.addPlace(new Place(place));

      return oboe.drop;
    })
    .node('stay', function(stay) {
      stay.duration = moment(stay.endAt).diff(stay.startAt, 's');
      initAction.addStay(new Stay(stay));

      return oboe.drop;
    })
    .node('trip', function(trip) {
      trip.duration = moment(trip.endAt).diff(trip.startAt, 's');
      initAction.addTrip(new Trip(trip));

      return oboe.drop;
    })
    .done(initAction.completed)
    .fail(initAction.failed);
});

module.exports = initAction;