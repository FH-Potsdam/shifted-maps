var immutable = require('immutable');

module.exports = immutable.Record({
  id: null,
  location: null,
  name: null,
  placeType: null,
  duration: 0,
  radius: 0,
  stays: new immutable.List()
});