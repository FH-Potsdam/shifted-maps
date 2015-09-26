export const UPDATE_MAP_STATE = 'UPDATE_MAP_STATE';
export const FIT_MAP_TO_BOUNDS = 'FIT_MAP_TO_BOUNDS';

export function updateMapState(map) {
  return { type: UPDATE_MAP_STATE, map };
}

export function fitMapToBounds(bounds) {
  return { type: FIT_MAP_TO_BOUNDS, bounds };
}