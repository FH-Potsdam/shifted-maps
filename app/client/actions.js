import oboe from 'oboe';
import moment from 'moment';
import tileRequester from './services/tileRequester';
import Place from './models/place';
import Stay from './models/stay';
import Trip from './models/trip';
import { placeRadiusRangeScaleSelector } from './selectors/scales';
import { placeRadiusScaleSelector } from './selectors/places';
import { visMapSelector } from './selectors/vis';

/*
 * action types
 */

export const REQUEST_STORYLINE = 'REQUEST_STORYLINE';
export const RECEIVE_STORYLINE = 'RECEIVE_STORYLINE';
export const FAIL_STORYLINE_REQUEST = 'FAIL_STORYLINE_REQUEST';
export const REQUEST_TILE = 'REQUEST_TILE';
export const RECEIVE_TILE = 'RECEIVE_TILE';
export const FAIL_TILE_REQUEST = 'FAIL_TILE_REQUEST';
export const ADD_PLACE = 'ADD_PLACE';
export const ADD_STAY = 'ADD_STAY';
export const ADD_TRIP = 'ADD_TRIP';
export const INIT_MAP = 'INIT_MAP';
export const MOVE_MAP = 'MOVE_MAP';
export const RESIZE_MAP = 'RESIZE_MAP';
export const ZOOM_MAP = 'ZOOM_MAP';
export const CHANGE_VIEW = 'CHANGE_VIEW';
export const UPDATE_SCALES = 'UPDATE_SCALES';
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

export function initMap(map) {
  return { type: INIT_MAP, map };
}

export function moveMap(map) {
  return { type: MOVE_MAP, map };
}

export function resizeMap(map) {
  return { type: RESIZE_MAP, map };
}

export function zoomMap(map, event) {
  return { type: ZOOM_MAP, map, event };
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

export function updateScales(elements) {
  return { type: UPDATE_SCALES, elements };
}

export function requestStoryline() {
  return { type: REQUEST_STORYLINE };
}

export function receiveStoryline(places, trips, stays) {
  return { type: RECEIVE_STORYLINE, places, trips, stays};
}

export function failStorylineRequest(error) {
  return { type: FAIL_STORYLINE_REQUEST, error };
}

export function fetchStoryline() {
  return function(dispatch) {
    dispatch(requestStoryline());

    let places = [],
      trips = [],
      stays = [];

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
      .node('place', function(place) {
        place = new Place(place);

        places.push(place);
        dispatch(addPlace(place));

        return oboe.drop;
      })
      .node('stay', function(stay) {
        stay.duration = moment(stay.endAt).diff(stay.startAt, 's');
        stay = new Stay(stay);

        stays.push(stay);
        dispatch(addStay(stay));

        return oboe.drop;
      })
      .node('trip', function(trip) {
        trip.duration = moment(trip.endAt).diff(trip.startAt, 's');
        trip = new Trip(trip);

        trips.push(trip);
        dispatch(addTrip(trip));

        return oboe.drop;
      })
      .done(() => dispatch(receiveStoryline(places, trips, stays)))
      .fail(error => dispatch(failStorylineRequest(error)));
  }
}

export function requestTile(node) {
  return { type: REQUEST_TILE };
}

export function receiveTile(node, tile, zoom) {
  return { type: RECEIVE_TILE, node, tile, zoom};
}

export function failTileRequest(node, error) {
  return { type: FAIL_TILE_REQUEST, error };
}

export function fetchTile(node) {
  return function(dispatch, getState) {
    process.nextTick(function() {
      let state = getState(),
        placeRadiusScale = placeRadiusScaleSelector(state),
        placeRadiusRangeScale = placeRadiusRangeScaleSelector(state),
        map = visMapSelector(state);

      dispatch(requestTile(node));

      tileRequester(node, map, placeRadiusScale, placeRadiusRangeScale, function(error, tile) {
        if (error)
          return dispatch(failTileRequest(node, error));

        dispatch(receiveTile(node, tile, map.getZoom()));
      });
    });
  };
}