import { createSelector } from 'reselect';

const uiSelector = state => state.ui;

export const uiTimeSpanSelector = createSelector(
  [
    uiSelector
  ],
  ui => ui.get('timeSpan')
);

export default uiSelector;