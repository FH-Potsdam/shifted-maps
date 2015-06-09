var Immutable = require('immutable');

module.exports = Immutable.Record({
  from: null,
  to: null,
  duration: null,
  distance: null,
  trips: new Immutable.List()
});