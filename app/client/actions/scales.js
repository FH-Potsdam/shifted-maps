export const UPDATE_SCALES = 'UPDATE_SCALES';

export function updateScales(scaleElements, sizerElements) {
  return { type: UPDATE_SCALES, scaleElements, sizerElements };
}