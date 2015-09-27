import { Map } from 'immutable';
import { SET_STORYLINE } from '../actions/storyline';
import { CHANGE_TIME_SPAN } from '../actions/ui';

export default function ui(state = Map(), action) {
  switch (action.type) {
    case SET_STORYLINE:
      let { stays } = action,
        timeSpanStart = Infinity,
        timeSpanEnd = -Infinity;

      stays.forEach(function(stay) {
        timeSpanStart = Math.min(stay.startAt, timeSpanStart);
        timeSpanEnd = Math.max(stay.endAt, timeSpanEnd);
      });

      let range = [timeSpanStart, timeSpanEnd];

      return state.withMutations(function(state) {
        state.set('timeSpanRange', range);
        state.set('timeSpan', range);
      });

    case CHANGE_TIME_SPAN:
      let { timeSpan } = action;

      console.log(timeSpan);

      return state.set('timeSpan', timeSpan);

    default:
      return state;
  }
}