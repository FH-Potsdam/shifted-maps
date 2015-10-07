import _ from 'lodash';
import Promise from 'promise';
import { GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW } from '../models/views';
import { geographicViewSelector, frequencyViewSelector, durationViewSelector } from '../selectors/views';
import { uiActiveViewSelector } from '../selectors/ui';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SET_LOCATIONS = 'SET_LOCATIONS';
export const CHANGE_TIME_SPAN = 'CHANGE_TIME_SPAN';

const VIEWS = [GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW];

const VIEW_SELECTORS = {
  [GEOGRAPHIC_VIEW]: geographicViewSelector,
  [FREQUENCY_VIEW]: frequencyViewSelector,
  [DURATION_VIEW]: durationViewSelector
};

let viewQueue;

export function initViews() {
  viewQueue = [...VIEWS];

  return processViewQueue();
}

export function updateViews() {
  return function(dispatch, getState) {
    let state = getState(),
      activeView = uiActiveViewSelector(state);

    viewQueue = [...VIEWS];

    if (activeView != null) {
      viewQueue = _.without(viewQueue, activeView);
      viewQueue.unshift(activeView);
    }

    dispatch(processViewQueue());
  };
}

function processViewQueue() {
  return function(dispatch) {
    let view = viewQueue.shift();

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