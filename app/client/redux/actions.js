import oboe from 'oboe';
import moment from 'moment';
import Place from './models/place';
import Stay from './models/stay';
import Trip from './models/trip';

/*
 * action types
 */

export const REQUEST_STORYLINE = 'REQUEST_STORYLINE';
export const RECEIVE_STORYLINE = 'RECEIVE_STORYLINE';
export const FAIL_STORYLINE_REQUEST = 'FAIL_STORYLINE_REQUEST';
export const ADD_PLACE = 'ADD_PLACE';
export const ADD_STAY = 'ADD_STAY';
export const ADD_TRIP = 'ADD_TRIP';
export const INIT_VIS = 'INIT_VIS';
export const MOVE_VIS = 'MOVE_VIS';
export const RESIZE_VIS = 'RESIZE_VIS';
export const ZOOM_VIS = 'ZOOM_VIS';
export const CHANGE_VIEW = 'CHANGE_VIEW';
export const CHANGE_TIME_SPAN = 'CHANGE_TIME_SPAN';
export const TOGGLE_NODE = 'TOGGLE_NODE';

/*
 * action creators
 */

export function addPlace(place) {
  return { type: ADD_PLACE, place };
}

export function addStay(stay) {
  return { type: ADD_STAY, stay };
}

export function addTrip(trip) {
  return { type: ADD_TRIP, trip };
}

export function initVis(map) {
  return { type: INIT_VIS, map };
}

export function moveVis(map) {
  return { type: MOVE_VIS, map };
}

export function resizeVis(map) {
  let elements = document.querySelectorAll('[data-scale]');

  return { type: RESIZE_VIS, map, elements };
}

export function zoomVis(map, event) {
  return { type: ZOOM_VIS, map, event };
}

export function changeView(view) {
  return { type: CHANGE_VIEW, view };
}

export function changeTimeSpan(start, end) {
  return { type: CHANGE_TIME_SPAN, start, end };
}

export function toggleNode(node) {
  return { type: TOGGLE_NODE, node };
}

export function requestStoryline() {
  return { type: REQUEST_STORYLINE };
}

export function receiveStoryline() {
  return { type: RECEIVE_STORYLINE };
}

export function failStorylineRequest(error) {
  return { type: FAIL_STORYLINE_REQUEST, error };
}

export function fetchStoryline() {
  return function(dispatch) {
    dispatch(requestStoryline());

    oboe('/api')
      .node('startAt', function(startAt) {
        return new Date(startAt * 1000);
      })
      .node('endAt', function(endAt) {
        return new Date(endAt * 1000);
      })
      .node('location', function(location) {
        return L.latLng(location.lat, location.lon);
      })
      /*.node('{startAt endAt}', function(object) {
       object.duration = moment(object.endAt).diff(object.startAt, 's');

       return object;
       })*/
      .node('place', function(place) {
        dispatch(addPlace(new Place(place)));

        return oboe.drop;
      })
      .node('stay', function(stay) {
        stay.duration = moment(stay.endAt).diff(stay.startAt, 's');
        dispatch(addStay(new Stay(stay)));

        return oboe.drop;
      })
      .node('trip', function(trip) {
        trip.duration = moment(trip.endAt).diff(trip.startAt, 's');
        dispatch(addTrip(new Trip(trip)));

        return oboe.drop;
      })
      .done(() => dispatch(receiveStoryline()))
      .fail(error => dispatch(failStorylineRequest(error)));
  }
}