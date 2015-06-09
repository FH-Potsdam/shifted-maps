var Immutable = require('immutable');

module.exports = Immutable.Record({
  id: null,
  location: null,
  name: null,
  placeType: null,
  duration: 0,
  relativeDuration: 1,
  stays: new Immutable.List(),
  radius: 0,
  point: null
});