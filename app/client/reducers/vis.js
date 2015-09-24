import { Map } from 'immutable';
import { INIT_VIS, ZOOM_VIS, MOVE_VIS, RESIZE_VIS } from '../actions';

const CLIP_PADDING = 0.5;

function calculateBounds(map) {
  var size = map.getSize(),
    min = map.containerPointToLayerPoint(size.multiplyBy(-CLIP_PADDING));

  return L.bounds(min, min.add(size.multiplyBy(1 + CLIP_PADDING * 2)));
}

function boundsToObject(bounds) {
  return {
    min: pointToObject(bounds.min),
    max: pointToObject(bounds.max),
    dimensions: pointToObject(bounds.getSize())
  };
}

function pointToObject(point) {
  return { x: point.x, y: point.y };
}

function initVis(state, map) {
  let bounds = calculateBounds(map),
    scale = d3.scale.linear()
      .domain([map.getMinZoom(), map.getMaxZoom()]);

  function view(place) {
    return map.latLngToLayerPoint(place.location);
  }

  return state.mergeDeep({
    translate: bounds.min,
    scale: scale(map.getZoom()),
    view,
    bounds: boundsToObject(bounds),
    transform: { translate: pointToObject(bounds.min), scale: null }
  });
}

function zoomVis(state, map, event) {
  let scale = map.getZoomScale(event.zoom),
    boundsMin = state.getIn(['bounds', 'min']).toObject,
    translate = map._getCenterOffset(event.center)._multiplyBy(-scale)._add(boundsMin);

  return state.mergeDeep({
    transform: {
      translate: pointToObject(translate),
      scale: scale
    }
  });
}

function moveVis(state, map) {
  let bounds = calculateBounds(map);

  return state.mergeDeep({
    bounds: boundsToObject(bounds),
    transform: { translate: pointToObject(bounds.min), scale: null }
  });
}

export default function vis(state = Map(), action) {
  switch (action.type) {
    case INIT_VIS:
      return initVis(state, action.map);

    case ZOOM_VIS:
      return zoomVis(state, action.map, action.event);

    case MOVE_VIS:
    case RESIZE_VIS:
      return moveVis(state, action.map);

    default:
      return state
  }
}