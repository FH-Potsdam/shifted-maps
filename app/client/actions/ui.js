import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import { GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW } from '../models/views';
import { geographicViewSelector, frequencyViewSelector, durationViewSelector } from '../selectors/views';
import { uiActiveViewSelector } from '../selectors/ui';
import { requestTiles } from '../actions/tiles';
import trackEvent from '../services/track-event';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SET_LOCATIONS = 'SET_LOCATIONS';
export const CHANGE_TIME_SPAN = 'CHANGE_TIME_SPAN';
export const HOVER_PLACE = 'HOVER_PLACE';
export const CLOSE_INTERACTION_OVERLAY = 'CLOSE_INTERACTION_OVERLAY';

const VIEWS = [GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW];

const VIEW_SELECTORS = {
  [GEOGRAPHIC_VIEW]: geographicViewSelector,
  [DURATION_VIEW]: durationViewSelector,
  [FREQUENCY_VIEW]: frequencyViewSelector
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
      dispatch(requestTiles());
      dispatch(processViewQueue());
    });
  }
}

export function changeView(view) {
  trackEvent('ui', 'change', 'view', view);

  return { type: CHANGE_VIEW, view };
}

export function changeTimeSpan(timeSpan) {
  let [ start, end ] = timeSpan;

  trackEvent('ui', 'filter', 'time span', moment(start).format('YYYY-MM-DD') + '-' + moment(end).format('YYYY-MM-DD'));

  return { type: CHANGE_TIME_SPAN, timeSpan };
}

export function hoverPlace(placeId, hover) {
  trackEvent('ui', 'hover', 'place');

  return { type: HOVER_PLACE, placeId, hover };
}

export function closeInteractionOverlay() {
  return { type: CLOSE_INTERACTION_OVERLAY };
}