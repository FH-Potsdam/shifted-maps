export const INIT_VIS = 'INIT_VIS';
export const MOVE_VIS = 'MOVE_VIS';
export const RESIZE_VIS = 'RESIZE_VIS';
export const ZOOM_VIS = 'ZOOM_VIS';
import trackEvent from '../services/track-event';

export function initVis(map, event) {
  return { type: INIT_VIS, map, event };
}

export function moveVis(map, event) {
  trackEvent('map', 'move');

  return { type: MOVE_VIS, map, event };
}

export function resizeVis(map, event) {
  trackEvent('map', 'resize');

  return { type: RESIZE_VIS, map, event };
}

export function zoomVis(map, event) {
  trackEvent('map', 'zoom ' + event.scale > 1 ? 'in' : 'out');

  return { type: ZOOM_VIS, map, event };
}