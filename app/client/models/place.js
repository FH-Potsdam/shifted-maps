import { Record, List } from 'immutable';

export default Record({
  id: null,
  location: null,
  name: null,
  placeType: null,
  duration: 0,
  frequency: 0,
  stays: new List(),
  radius: 0,
  strokeWidth: 0,
  point: null,
  visible: false
});