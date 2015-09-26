export const INIT_MAP = 'INIT_MAP';
export const MOVE_MAP = 'MOVE_MAP';
export const RESIZE_MAP = 'RESIZE_MAP';
export const ZOOM_MAP = 'ZOOM_MAP';

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