import { mapZoomSelector } from '../selectors/map';

export const UPDATE_VIEW = 'UPDATE_VIEW';

export function updateView(activeView, nodes) {
  return function(dispatch, getState) {
    let state = getState(),
      mapZoom = mapZoomSelector(state);

    dispatch({ type: UPDATE_VIEW, activeView, mapZoom, nodes });
  };
}