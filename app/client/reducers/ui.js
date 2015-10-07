import { Map } from 'immutable';
import { SET_STORYLINE } from '../actions/storyline';
import { CHANGE_TIME_SPAN, CHANGE_VIEW, SET_LOCATIONS } from '../actions/ui';
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

  return state.setIn(['locations', view], locations);
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

    default:
      return state;
  }
}