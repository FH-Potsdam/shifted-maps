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
  ui => ui.get('actieView')
);

export const uiLocatorSelector = createSelector(
  [
    uiSelector
  ],
  ui => ui.get('locator')
);

export default uiSelector;