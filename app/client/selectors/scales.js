export default state => state.scales;

export const edgeStrokeWidthRangeScaleSelector = state => state.scales.get('edge-stroke-width');

export const nodeStrokeWidthRangeScaleSelector = state => state.scales.get('place-stroke-width');

export const nodeRadiusRangeScaleSelector = state => state.scales.get('place-radius');