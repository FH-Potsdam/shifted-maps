import { Map } from 'immutable';
import config from '../config';
import { UPDATE_MAP_STATE, FIT_MAP_TO_BOUNDS } from '../actions/map';

const DEFAULT_STATE = {
  id: config.mapbox.id,
  zoom: 10,
  center: [52.520007, 13.404954],
  options: {},
  bounds: null
};

export default function map(state = Map(DEFAULT_STATE), action) {
  switch (action.type) {
    case UPDATE_MAP_STATE:
      let { map } = action;

      return state.merge({
        zoom: map.getZoom(),
        center: map.getCenter(),
        bounds: null,
        map
      });

    case FIT_MAP_TO_BOUNDS:
      let { bounds } = action;

      return state.set('bounds', bounds);

    default:
      return state
  }
}