export const TOGGLE_Place = 'TOGGLE_PLACE';

export function togglePlace(place) {
  return { type: TOGGLE_PLACE, place };
}