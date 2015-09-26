import { Map } from 'immutable';
import { INIT_MAP, ZOOM_MAP, MOVE_MAP, RESIZE_MAP } from '../actions/map';

const CLIP_PADDING = 0.5;

function calculateBounds(map) {
  var size = map.getSize(),
    min = map.containerPointToLayerPoint(size.multiplyBy(-CLIP_PADDING));

  return L.bounds(min, min.add(size.multiplyBy(1 + CLIP_PADDING * 2)));
}

function initVis(map) {
  let bounds = calculateBounds(map),
    scale = d3.scale.linear()
      .domain([map.getMinZoom(), map.getMaxZoom()]);

  function view(place) {
    return map.latLngToLayerPoint(place.location);
  }

  let mapZoom = map.getZoom();

  return {
    translate: bounds.min,
    scale: scale(mapZoom),
    transform: { translate: bounds.min, scale: null },
    view, bounds, map, mapZoom
  };
}

function zoomVis(map, bounds, event) {
  let scale = map.getZoomScale(event.zoom),
    boundsMin = bounds.get('min').toObject(),
    translate = map._getCenterOffset(event.center)._multiplyBy(-scale)._add(boundsMin);

  return {
    transform: { translate, scale, map }
  };
}

function moveVis(map) {
  let bounds = calculateBounds(map),
    mapZoom = map.getZoom();

  return {
    transform: { translate: bounds.min, scale: null },
    bounds, map, mapZoom
  };
}

export default function vis(state = Map(), action) {
  switch (action.type) {
    case INIT_MAP:
      return state.merge(initVis(action.map));

    case ZOOM_MAP:
      return state.merge(zoomVis(action.map, state.get('bounds'), action.event));

    case MOVE_MAP:
    case RESIZE_MAP:
      return state.merge(moveVis(action.map));

    default:
      return state
  }
}