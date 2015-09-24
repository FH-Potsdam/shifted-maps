export default state => state.scales;

export const connectionStrokeWidthRangeScaleSelector = state => state.scales.get('edge-stroke-width');

export const placeStrokeWidthRangeScaleSelector = state => state.scales.get('place-stroke-width');

export const placeRadiusRangeScaleSelector = state => state.scales.get('place-radius');