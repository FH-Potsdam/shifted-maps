import { scaledPlacesSelector } from '../selectors/places';
import { fitMapToBounds } from './map';

export const TOGGLE_Place = 'TOGGLE_PLACE';
export const FIT_PLACES = 'FIT_PLACES';

export function togglePlace(place) {
  return { type: TOGGLE_PLACE, place };
}

export function fitPlaces() {
  return function(dispatch, getState) {
    let state = getState(),
      places = scaledPlacesSelector(state);

    let bounds = new L.LatLngBounds(),
      importantPlaces = places.slice(-3);

    importantPlaces.forEach(function(place) {
      bounds.extend(place.location);
    });

    dispatch(fitMapToBounds(bounds));
  };
}