export default state => state.scales;

export const edgeStrokeWidthRangeScaleSelector = state => state.scales.get('edge-stroke-width');

export const nodeStrokeWidthRangeScaleSelector = state => {
  return state.scales.get('place-stroke-width');
};

export const nodeRadiusRangeScaleSelector = state => {
  return state.scales.get('place-radius');
};