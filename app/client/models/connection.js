import { Record, List } from 'immutable';

export default Record({
  id: null,
  from: null,
  to: null,
  fromPoint: null,
  toPoint: null,
  duration: 0,
  frequency: 0,
  distance: 0,
  beeline: 0,
  trips: new List(),
  strokeWidth: 0,
  connection: null,
  visible: false,
  rank: 0
});