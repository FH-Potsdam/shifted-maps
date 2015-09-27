import oboe from 'oboe';
import { requestTiles } from './tiles';
import { fitPlaces } from './places';
import Place from '../models/place';
import Stay from '../models/stay';
import Trip from '../models/trip';

export const ADD_PLACE = 'ADD_PLACE';
export const ADD_STAY = 'ADD_STAY';
export const ADD_TRIP = 'ADD_TRIP';
export const REQUEST_STORYLINE = 'REQUEST_STORYLINE';
export const SET_STORYLINE = 'SET_STORYLINE';
export const FAILED_STORYLINE_REQUEST = 'FAILED_STORYLINE_REQUEST';

export function addPlace(place) {
  return { type: ADD_PLACE, place };
}

export function addStay(stay) {
  return { type: ADD_STAY, stay };
}

export function addTrip(trip) {
  return { type: ADD_TRIP, trip };
}

export function requestStoryline() {
  return function(dispatch) {
    dispatch({ type: REQUEST_STORYLINE });

    let places = [],
      trips = [],
      stays = [];

    oboe('/api')
      .node('startAt', function(startAt) {
        return new Date(startAt * 1000);
      })
      .node('endAt', function(endAt) {
        return new Date(endAt * 1000);
      })
      .node('location', function(location) {
        return L.latLng(location.lat, location.lon);
      })
      .node('place', function(place) {
        place = new Place(place);

        places.push(place);
        dispatch(addPlace(place));

        return oboe.drop;
      })
      .node('stay', function(stay) {
        stay = new Stay(stay);

        stays.push(stay);
        dispatch(addStay(stay));

        return oboe.drop;
      })
      .node('trip', function(trip) {
        trip = new Trip(trip);

        trips.push(trip);
        dispatch(addTrip(trip));

        return oboe.drop;
      })
      .done(() => dispatch(setStoryline(places, trips, stays)))
      .fail(error => dispatch(failedStorylineRequest(error)));
  }
}

export function setStoryline(places, trips, stays) {
  return function(dispatch) {
    dispatch({ type: SET_STORYLINE, places, trips, stays});
    dispatch(requestTiles());
    dispatch(fitPlaces());
  };
}

export function failedStorylineRequest(error) {
  return { type: FAILED_STORYLINE_REQUEST, error };
}