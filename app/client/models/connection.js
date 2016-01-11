import { Record, List } from 'immutable';

const Connection = Record({
  id: null,
  from: null,
  to: null,
  //fromPoint: null,
  //toPoint: null,
  duration: 0,
  frequency: 0,
  distance: 0,
  //beeline: 0,
  trips: new List(),
  strokeWidth: 0,
  connection: null,
  visible: false,
  rank: 0,
  label: null
});

function uniqueId(idOne, idTwo) {
  return idOne + idTwo * idTwo;
}

Connection.getId = function(from, to) {
  return from < to ? uniqueId(from, to) : uniqueId(to, from);
};

export default Connection;