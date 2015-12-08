import { Map } from 'immutable';
import { INIT_VIS, ZOOM_VIS, MOVE_VIS, RESIZE_VIS } from '../actions/vis';
import { CHANGE_VIEW } from '../actions/ui'

const CLIP_PADDING = 0.5;

function calculateBounds(map) {
  var size = map.getSize(),
    min = map.containerPointToLayerPoint(size.multiplyBy(-CLIP_PADDING));

  return L.bounds(min, min.add(size.multiplyBy(1 + CLIP_PADDING * 2)));
}

function initVis(map) {
  let bounds = calculateBounds(map),
    zoom = map.getZoom(),
    scale = d3.scale.linear()
      .domain([map.getMinZoom(), map.getMaxZoom()]);

  return {
    translate: bounds.min,
    scale: scale(zoom),
    transform: { translate: bounds.min, scale: null },
    bounds, zoom
  };
}

function zoomVis(map, bounds, event) {
  let scale = map.getZoomScale(event.zoom),
    boundsMin = bounds.get('min').toObject(),
    translate = map._getCenterOffset(event.center)._multiplyBy(-scale)._add(boundsMin);

  return {
    transform: { translate, scale }
  };
}

function moveVis(map) {
  let bounds = calculateBounds(map);

  return {
    transform: { translate: bounds.min, scale: null },
    bounds
  };
}

export default function vis(state = Map(), action) {
  switch (action.type) {
    case INIT_VIS:
      return state.merge(initVis(action.map));

    case ZOOM_VIS:
      return state.merge(zoomVis(action.map, state.get('bounds'), action.event));

    case MOVE_VIS:
    case RESIZE_VIS:
      return state.merge(moveVis(action.map));

    default:
      return state
  }
}