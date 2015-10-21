import { Map } from 'immutable';
import { SET_STORYLINE } from '../actions/storyline';
import { CHANGE_TIME_SPAN, CHANGE_VIEW, SET_LOCATIONS, HOVER_PLACE, DEMO } from '../actions/ui';
import { GEOGRAPHIC_VIEW } from '../models/views';

function setStoryline(state, action) {
  let { stays } = action,
    timeSpanStart = Infinity,
    timeSpanEnd = -Infinity;

  stays.forEach(function(stay) {
    timeSpanStart = Math.min(stay.startAt, timeSpanStart);
    timeSpanEnd = Math.max(stay.endAt, timeSpanEnd);
  });

  let day = 1000 * 60 * 60 * 24;

  timeSpanStart = Math.floor(timeSpanStart / day) * day;
  timeSpanEnd = Math.ceil(timeSpanEnd / day) * day;

  let range = [timeSpanStart, timeSpanEnd];

  return state.withMutations(function(state) {
    state.set('timeSpanRange', range);
    state.set('timeSpan', range);
    state.set('timeSpanStep', day);
  });
}

function changeTimeSpan(state, action) {
  let { timeSpan } = action;

  return state.set('timeSpan', timeSpan);
}

function changeView(state, action) {
  let { view } = action;

  return state.set('activeView', view);
}

function setLocations(state, action) {
  let { view, locations } = action;

  return state.mergeIn(['locations', view], locations);
}

function setHoveredPlace(state, action) {
  let { placeId, hover } = action;

  return state.merge({
    hoveredPlaceId: placeId,
    hover
  });
}

function setDemo(state, action) {
  return state.set('demo', action.demo);
}

export default function ui(state = Map(), action) {
  switch (action.type) {
    case SET_STORYLINE:
      return setStoryline(state, action);

    case CHANGE_TIME_SPAN:
      return changeTimeSpan(state, action);

    case CHANGE_VIEW:
      return changeView(state, action);

    case SET_LOCATIONS:
      return setLocations(state, action);

    case HOVER_PLACE:
      return setHoveredPlace(state, action);

    case DEMO:
      return setDemo(state, action);

    default:
      return state;
  }
}