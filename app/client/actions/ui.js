import _ from 'lodash';
import Promise from 'promise';
import { GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW } from '../models/views';
import { geographicViewSelector, frequencyViewSelector, durationViewSelector } from '../selectors/views';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SET_LOCATIONS = 'SET_LOCATIONS';
export const CHANGE_TIME_SPAN = 'CHANGE_TIME_SPAN';

const VIEW_SELECTORS = {
  [GEOGRAPHIC_VIEW]: geographicViewSelector,
  [FREQUENCY_VIEW]: frequencyViewSelector,
  [DURATION_VIEW]: durationViewSelector
};

const VIEW_QUEUE = [];

export function initViews() {
  VIEW_QUEUE.push(GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW);

  return function(dispatch) {
    dispatch(processViewQueue());
  };
}

function processViewQueue() {
  return function(dispatch) {
    let view = VIEW_QUEUE.shift();

    if (view == null) return;

    dispatch(computeViewLocations(view));
  };
}

function computeViewLocations(view) {
  return function(dispatch, getState) {
    let state = getState(),
      viewServiceSelector = VIEW_SELECTORS[view],
      viewService = viewServiceSelector(state);

    viewService(function(error, locations) {
      dispatch({ type: SET_LOCATIONS, view, locations });
      dispatch(processViewQueue());
    });
  }
}

export function changeView(view) {
  return function(dispatch) {
    dispatch({ type: CHANGE_VIEW, view });
  };
}

export function changeTimeSpan(timeSpan) {
  return { type: CHANGE_TIME_SPAN, timeSpan };
}