import oboe from 'oboe';
import moment from 'moment';
import { createTileRequest } from './services/tiles';
import Place from './models/place';
import Stay from './models/stay';
import Trip from './models/trip';
import Tile from './models/tile';
import { placeRadiusRangeScaleSelector } from './selectors/scales';
import { placeRadiusScaleSelector, tiledPlacesSelector } from './selectors/places';
import { visMapSelector, visMapZoomSelector } from './selectors/vis';
import { tileRequestsSelector } from './selectors/tiles';

/*
 * action types
 */

export const REQUEST_STORYLINE = 'REQUEST_STORYLINE';
export const RECEIVE_STORYLINE = 'RECEIVE_STORYLINE';
export const FAIL_STORYLINE_REQUEST = 'FAIL_STORYLINE_REQUEST';
export const QUEUE_TILE_REQUEST = 'QUEUE_TILE_REQUEST';
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

export function initMap(map, event) {
  return { type: INIT_MAP, map, event };
}

export function moveMap(map, event) {
  return { type: MOVE_MAP, map, event };
}

export function resizeMap(map, event) {
  return { type: RESIZE_MAP, map, event };
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

export function receiveStoryline(places, trips, stays) {
  return function(dispatch) {
    dispatch({ type: RECEIVE_STORYLINE, places, trips, stays});
    dispatch(requestTiles());
  };
}

export function failStorylineRequest(error) {
  return { type: FAIL_STORYLINE_REQUEST, error };
}

export function requestStoryline() {
  return function(dispatch) {
    dispatch({ type: REQUEST_STORYLINE });

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

export function requestTiles() {
  return function(dispatch, getState) {
    let state = getState(),
      places = tiledPlacesSelector(state),
      requests = tileRequestsSelector(state),
      placeRadiusScale = placeRadiusScaleSelector(state),
      placeRadiusRangeScale = placeRadiusRangeScaleSelector(state),
      map = visMapSelector(state),
      zoom = visMapZoomSelector(state);

    places.forEach(function(place) {
      if (!place.visible || place.tile != null || requests.has(place.id))
        return;

      // @TODO Use webworker
      process.nextTick(function() {
        let request = createTileRequest(place, map, placeRadiusScale, placeRadiusRangeScale);

        dispatch(queueTileRequest(place, request, zoom));
      });
    });
  }
}

export function receiveTile(place, tile, zoom) {
  return function(dispatch, getState) {
    dispatch({ type: RECEIVE_TILE, place, tile, zoom})

    let state = getState(),
      requests = tileRequestsSelector(state);

    // request next
    if (requests.size > 0) {
      let request = requests.first(),
        places = tiledPlacesSelector(state),
        place = places.get(request.id);

      dispatch(requestTile(place, request, zoom));
    }
  };
}

export function failTileRequest(place, error) {
  return { type: FAIL_TILE_REQUEST, place, error };
}

export function queueTileRequest(place, request, zoom) {
  return function(dispatch, getState) {
    dispatch({ type: QUEUE_TILE_REQUEST, place, request });

    let state = getState(),
      requests = tileRequestsSelector(state);

    if (requests.size === 1) {
      dispatch(requestTile(place, request, zoom));
    }
  };
}

export function requestTile(place, request, zoom) {
  return function(dispatch) {
    request.send(function (error, tile) {
      if (error)
        return dispatch(failTileRequest(place, error));

      dispatch(receiveTile(place, new Tile(tile), zoom));
    });
  }
}