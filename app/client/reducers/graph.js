import { Map } from 'immutable';
import forEach from 'lodash/collection/forEach';
import { INIT_POINTS, INIT_BEELINES, START_GRAPH, TICK_GRAPH } from '../actions/graph';
import { ZOOM_VIS, INIT_VIS } from '../actions/vis';

const DEFAULT_STATE = Map({ views: Map() });

function initPoints(state, action) {
  let { map, places } = action,
    points = {};

  places.forEach(function(place, id) {
    points[id] = map.latLngToLayerPoint(place.location);
  });

  return state.set('points', points);
}

function initBeelines(state, action) {
  if (state.has('beelines'))
    return state;

  let { points, connections } = action,
    beelines = {};

  connections.forEach(function(connection, id) {
    let from = points[connection.from],
      to = points[connection.to];

    beelines[id] = from.distanceTo(to);
  });

  return state.set('beelines', beelines);
}

function startGraph(state, action) {
  let { force } = action;

  return state.set('force', force);
}

function tickGraph(state, action) {
  let { force } = action,
    points = {};

  force.nodes().forEach(function(node) {
    points[node.place] = L.point(node.x, node.y);
  });

  return state.setIn(['points'], points);
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

    case TICK_GRAPH:
      return tickGraph(state, action);

    case INIT_POINTS:
      return initPoints(state, action);

    case INIT_BEELINES:
      return initBeelines(state, action);

    /*case ZOOM_VIS:
      return storeLocations(state, action);

    case INIT_VIS:
      return initPoints(state, action);*/
  }

  return state;
}