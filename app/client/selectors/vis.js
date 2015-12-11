import { createSelector, createStructuredSelector } from 'reselect';
import { uiActiveViewSelector } from './ui';

function toBounds(bounds) {
  let min = bounds.get('min'),
    max = bounds.get('max');

  return L.bounds([[min.get('x'), min.get('y')], [max.get('x'), max.get('y')]])
}

function visSelector(state) {
  return state.vis;
}

export const visScaleSelector = createSelector(
  [
    visSelector
  ],
  (vis) => vis.get('scale')
);

export const visBoundsSelector = createSelector(
  [
    visSelector
  ],
  (vis) => toBounds(vis.get('bounds'))
);

export const visTransformSelector = createSelector(
  [
    visSelector
  ],
  (vis) => vis.get('transform')
);

export const visZoomSelector = createSelector(
  [
    visSelector
  ],
  (vis) => vis.get('zoom')
);

export default createStructuredSelector({
  scale: visScaleSelector,
  bounds: visBoundsSelector,
  transform: visTransformSelector,
  zoom: visZoomSelector,
  activeView: uiActiveViewSelector
});