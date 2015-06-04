var Reflux = require('Reflux'),
  oboe = require('oboe');

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
    .node('place', function(place) {
      initAction.addPlace(place);
    })
    .node('stay', function(stay) {
      initAction.addStay(stay);
    })
    .node('trip', function(trip) {
      initAction.addTrip(trip);
    })
    .done(initAction.completed)
    .fail(initAction.failed);
});

module.exports = initAction;