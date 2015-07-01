var Immutable = require('immutable');

module.exports = Immutable.Record({
  from: null,
  to: null,
  strokeWidth: 0,
  edges: Immutable.List()
});