import { Record, List } from 'immutable';

export default Record({
  id: null,
  location: null,
  name: null,
  placeType: null,
  duration: 0,
  stays: new List()
});