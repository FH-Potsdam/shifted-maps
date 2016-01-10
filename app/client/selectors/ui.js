import { createSelector } from 'reselect';

const uiSelector = state => state.ui;

export const uiTimeSpanSelector = createSelector(
  [
    uiSelector
  ],
  ui => ui.get('timeSpan')
);

export const uiActiveViewSelector = createSelector(
  [
    uiSelector
  ],
  ui => ui.get('activeView')
);

export const uiHoveredPlaceIdSelector = createSelector(
  [
    uiSelector
  ],
  ui => ui.get('hoveredPlaceId')
);

export const uiHoverSelector = createSelector(
  [
    uiSelector
  ],
  ui => ui.get('hover')
);

export const uiClusterStrength = createSelector(
  [
    uiSelector
  ],
  ui => ui.get('clusterStrength')
);

export default uiSelector;