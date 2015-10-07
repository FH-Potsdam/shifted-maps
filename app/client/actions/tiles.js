import { createTileRequest } from '../services/tiles';
import Tile from '../models/tile';
import { placeRadiusRangeScaleSelector } from '../selectors/scales';
import { placeRadiusScaleSelector, tiledPlacesSelector } from '../selectors/places';
import { mapMapSelector, mapZoomSelector } from '../selectors/map';
import { tileRequestsSelector } from '../selectors/tiles';

export const QUEUE_TILE_REQUEST = 'QUEUE_TILE_REQUEST';
export const REQUEST_TILES = 'REQUEST_TILES';
export const RECEIVE_TILE = 'RECEIVE_TILE';
export const FAIL_TILE_REQUEST = 'FAIL_TILE_REQUEST';

export function requestTiles() {
  return function(dispatch, getState) {
    dispatch({ type: REQUEST_TILES });

    let state = getState(),
      places = tiledPlacesSelector(state),
      requests = tileRequestsSelector(state),
      placeRadiusScale = placeRadiusScaleSelector(state),
      placeRadiusRangeScale = placeRadiusRangeScaleSelector(state),
      map = mapMapSelector(state),
      zoom = mapZoomSelector(state);

    places.forEach(function(place) {
      if (!place.visible || place.tile != null || requests.has(place.id))
        return;

      createTileRequest(place, map, placeRadiusScale, placeRadiusRangeScale, function(error, request) {
        dispatch(queueTileRequest(place, request, zoom));
      });
    });
  }
}

export function receiveTile(place, tile, zoom) {
  return function(dispatch, getState) {
    dispatch({ type: RECEIVE_TILE, place, tile, zoom});

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

      tile.duration = place.duration;

      dispatch(receiveTile(place, new Tile(tile), zoom));
    });
  }
}