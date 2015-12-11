import { Map } from 'immutable';
import { INIT_VIS, ZOOM_VIS, MOVE_VIS, RESIZE_VIS } from '../actions/vis';
import { CHANGE_VIEW } from '../actions/ui';

const CLIP_PADDING = 0.5;

function calculateBounds(map) {
  var size = map.getSize(),
    min = map.containerPointToLayerPoint(size.multiplyBy(-CLIP_PADDING));

  return L.bounds(min, min.add(size.multiplyBy(1 + CLIP_PADDING * 2)));
}

function initVis(state, action) {
  let { map } = action,
    bounds = calculateBounds(map),
    zoom = map.getZoom(),
    scale = d3.scale.linear()
      .domain([map.getMinZoom(), map.getMaxZoom()]);

  return state.merge({
    translate: bounds.min,
    scale: scale(zoom),
    transform: { translate: bounds.min, scale: null },
    bounds, zoom, map
  });
}

function zoomVis(state, action) {
  let { map, event } = action,
    scale = map.getZoomScale(event.zoom),
    boundsMin = state.getIn(['bounds', 'min']).toObject(),
    translate = map._getCenterOffset(event.center)._multiplyBy(-scale)._add(boundsMin);

  return state.merge({ transform: { translate, scale } });
}

function moveVis(state, action) {
  let { map } = action,
    bounds = calculateBounds(map);

  return state.merge({
    transform: { translate: bounds.min, scale: null },
    bounds
  });
}

export default function vis(state = Map(), action) {
  switch (action.type) {
    case INIT_VIS:
      return initVis(state, action);

    case ZOOM_VIS:
      return zoomVis(state, action);

    case MOVE_VIS:
    case RESIZE_VIS:
      return moveVis(state, action);

    default:
      return state
  }
}