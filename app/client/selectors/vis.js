import { createSelector, createStructuredSelector } from 'reselect';

function toBounds(bounds) {
  let min = bounds.get('min'),
    max = bounds.get('max');

  return L.bounds([[min.get('x'), min.get('y')], [max.get('x'), max.get('y')]])
}

export const visScaleSelector = state => state.vis.get('scale');

export const visBoundsSelector = state => toBounds(state.vis.get('bounds'));

export const visTransformSelector = state => state.vis.get('transform');

export const visZoomSelector = state => state.vis.get('zoom');

export const visAnimateSelector = state => state.vis.get('animate');

export default createStructuredSelector({
  scale: visScaleSelector,
  bounds: visBoundsSelector,
  transform: visTransformSelector,
  zoom: visZoomSelector,
  animate: visAnimateSelector
});