import { Map } from 'immutable';
import forEach from 'lodash/collection/forEach';
import { RESTORE_POINTS, STORE_POINTS, START_GRAPH, STOP_GRAPH, TICK_GRAPH, MOVE_POINTS, PUT_POINTS, STORE_POINT } from '../actions/graph';
import { ZOOM_VIS, INIT_VIS } from '../actions/vis';

const DEFAULT_STATE = Map({
  points: null,
  beelines: null,
  lastLocations: null,
  lastActiveView: null,
  transition: false
});

function storePoints(state, action) {
  let { map, force } = action,
    nodes = force.nodes(),
    locations = {};

  nodes.forEach(function(node) {
    let point = L.point(node.x, node.y);

    locations[node.place] = map.layerPointToLatLng(point);
  });

  return state.set('lastLocations', Map(locations));
}

function restorePoints(state, action) {
  let { map } = action,
    lastLocations = state.get('lastLocations');

  if (lastLocations == null)
    return state;

  let points = Object.assign({}, state.get('points'));

  lastLocations.forEach(function(location, id) {
    points[id] = map.latLngToLayerPoint(location);
  });

  return state.set('points', points);
}

function startGraph(state, action) {
  let { force, points } = action;

  return state.withMutations(state => {
    state.set('force', force);
    state.set('points', points);
  });
}

function stopGraph(state) {
  return state.set('force', null);
}

function tickGraph(state, action) {
  let { force } = action,
    points = Object.assign({}, state.get('points'));

  force.nodes().forEach(function(node) {
    points[node.place] = L.point(node.x, node.y);
  });

  return state.set('points', points);
}

function putPoints(state) {
  return state.set('transition', false);
}

function movePoints(state) {
  return state.set('transition', true);
}

/*function storeLocations(state, action) {
  let { map } = action;

  if (_lastActiveView == null)
    return state;

  let points = state.getIn(['views', _lastActiveView, 'points']);

  if (points == null)
    return state;

  let locations = {};

  forEach(points, function(point, id) {
    locations[id] = map.layerPointToLatLng(point);
  });

  return state.setIn(['views', _lastActiveView, 'locations'], locations);
}

function initPoints(state, action) {
  let { map } = action;

  if (_lastActiveView == null)
    return state;

  let locations = state.getIn(['views', _lastActiveView, 'locations']),
    points = {};

  forEach(locations, function(latLng, id) {
    points[id] = map.latLngToLayerPoint(latLng);
  });

  return state.setIn(['views', _lastActiveView, 'points'], points);
}*/

export default function views(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case START_GRAPH:
      return startGraph(state, action);

    case STOP_GRAPH:
      return stopGraph(state, action);

    case TICK_GRAPH:
      return tickGraph(state, action);

    case STORE_POINTS:
      return storePoints(state, action);

    case RESTORE_POINTS:
      return restorePoints(state, action);

    case PUT_POINTS:
      return putPoints(state, action);

    case MOVE_POINTS:
      return movePoints(state, action);

    /*case ZOOM_VIS:
      return storeLocations(state, action);

    case INIT_VIS:
      return initPoints(state, action);*/
  }

  return state;
}