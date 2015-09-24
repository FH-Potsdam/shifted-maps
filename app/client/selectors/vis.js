export default state => state.vis;

export const visScaleSelector = state => state.vis.get('scale');

export const visBoundsSelector = state => state.vis.get('bounds');

export const visViewSelector = state => state.vis.get('view');