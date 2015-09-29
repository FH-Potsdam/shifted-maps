import { GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW } from '../models/views';
import { geographicViewSelector, frequencyViewSelector, durationViewSelector } from '../selectors/views';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const CHANGE_VIEW_SERVICE = 'CHANGE_VIEW_SERVICE';
export const CHANGE_TIME_SPAN = 'CHANGE_TIME_SPAN';

const VIEW_SELECTORS = {
  [GEOGRAPHIC_VIEW]: geographicViewSelector,
  [FREQUENCY_VIEW]: frequencyViewSelector,
  [DURATION_VIEW]: durationViewSelector
};

export function changeView(view) {
  return function(dispatch) {
    dispatch({ type: CHANGE_VIEW, view });
    dispatch(changeViewService(view));
  };
}

export function changeViewService(view) {
  return function(dispatch, getState) {
    let state = getState(),
      viewServiceSelector = VIEW_SELECTORS[view],
      viewService = viewServiceSelector(state);

    viewService(function(error, locator) {
      dispatch({ type: CHANGE_VIEW_SERVICE, locator });
    });
  }
}

export function changeTimeSpan(timeSpan) {
  return { type: CHANGE_TIME_SPAN, timeSpan };
}