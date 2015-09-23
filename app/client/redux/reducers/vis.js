import { Map } from 'immutable';
import { INIT_VIS, ZOOM_VIS, MOVE_VIS, RESIZE_VIS } from '../actions';

const CLIP_PADDING = 0.5;

function calculateBounds(map) {
  var size = map.getSize(),
    min = map.containerPointToLayerPoint(size.multiplyBy(-CLIP_PADDING));

  return L.bounds(min, min.add(size.multiplyBy(1 + CLIP_PADDING * 2)));
}

function initVis(state, map) {
  let scale = d3.scale.linear()
      .domain([map.getMinZoom(), map.getMaxZoom()]);

  function view(place) {
    return map.latLngToLayerPoint(place.location);
  }

  return state.merge({ scale, view });
}

function zoomVis(state, map, event) {
  let scale = map.getZoomScale(event.zoom),
    boundsMin = state.get('bounds').min,
    translate = map._getCenterOffset(event.center)._multiplyBy(-scale)._add(boundsMin.toObject());

  return state.mergeDeep({
    transform: {
      translate: translate,
      scale: scale
    }
  });
}

function moveVis(state, map) {
  let bounds = calculateBounds(map);

  return state.mergeDeep({
    bounds: bounds,
    transform: { translate: bounds.min, scale: null }
  });
}

export default function vis(state = Map(), action) {
  switch (action.type) {
    case INIT_VIS:
      return initVis(state, action.map);

    case ZOOM_VIS:
      return zoomVis(state, ...action);

    case MOVE_VIS:
    case RESIZE_VIS:
      return moveVis(state, action.map);

    default:
      return state
  }
}