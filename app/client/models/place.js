var Immutable = require('immutable');

module.exports = Immutable.Record({
  id: null,
  location: null,
  name: null,
  placeType: null,
  duration: 0,
  stays: new Immutable.List()
});