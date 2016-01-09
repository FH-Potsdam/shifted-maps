import { startGraph, stopGraph, putPoints, storePoints, restorePoints } from './graph';

export const INIT_VIS = 'INIT_VIS';
export const MOVE_VIS = 'MOVE_VIS';
export const RESIZE_VIS = 'RESIZE_VIS';
export const ZOOM_VIS = 'ZOOM_VIS';

export function initVis(map, event) {
  return function(dispatch) {
    dispatch({ type: INIT_VIS, map, event });
    dispatch(restorePoints());
    dispatch(startGraph());
  };
}

export function moveVis(map, event) {
  return { type: MOVE_VIS, map, event };
}

export function resizeVis(map, event) {
  return { type: RESIZE_VIS, map, event };
}

export function zoomVis(map, event) {
  return function(dispatch) {
    dispatch(storePoints());
    dispatch(stopGraph());
    dispatch(putPoints());
    dispatch({ type: ZOOM_VIS, map, event })
  };
}