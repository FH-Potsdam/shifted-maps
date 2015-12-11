import { createSelector } from 'reselect';
import { uiActiveViewSelector } from './ui';
import { mapPointsSelector, mapZoomSelector } from './map';

export default function viewsSelector(state) {
  return state.views;
}

export const activeViewSelector = createSelector(
  [
    viewsSelector,
    uiActiveViewSelector
  ],
  function(views, uiActiveView) {
    return views.get(uiActiveView);
  }
);

export const activeViewPointsSelector = createSelector(
  [
    activeViewSelector,
    mapPointsSelector,
    mapZoomSelector
  ],
  function(activeView, mapPoints, mapZoom) {
    if (activeView == null)
      return mapPoints;

    return activeView.get(mapZoom, mapPoints);
  }
);