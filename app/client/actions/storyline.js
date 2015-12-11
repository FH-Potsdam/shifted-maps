import oboe from 'oboe';
import debounce from 'mout/function/debounce';
import { fitPlaces } from './places';
import Place from '../models/place';
import Stay from '../models/stay';
import Trip from '../models/trip';

export const ADD_PLACES = 'ADD_PLACES';
export const ADD_STAYS = 'ADD_STAYS';
export const ADD_TRIPS = 'ADD_TRIPS';
export const DONE_STORYLINE_REQUEST = 'DONE_STORYLINE_REQUEST';
export const FAILED_STORYLINE_REQUEST = 'FAILED_STORYLINE_REQUEST';

export function addPlaces(places) {
  return { type: ADD_PLACES, places };
}

export function addStays(stays) {
  return { type: ADD_STAYS, stays };
}

export function addTrips(trips) {
  return { type: ADD_TRIPS, trips };
}

export function requestStoryline() {
  return function(dispatch) {
    let places = [],
      stays = [],
      trips = [];

    let debounceDispatch = debounce(dispatch, 5);

    function sendStoryline() {
      return function(dispatch) {
        dispatch(addPlaces(places));
        dispatch(addStays(stays));
        dispatch(addTrips(trips));

        // Reset data arrays
        places = [];
        stays = [];
        trips = [];
      }
    }

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

        debounceDispatch(sendStoryline());

        return oboe.drop;
      })
      .node('stay', function(stay) {
        stay = new Stay(stay);
        stays.push(stay);

        debounceDispatch(sendStoryline());

        return oboe.drop;
      })
      .node('trip', function(trip) {
        trip = new Trip(trip);
        trips.push(trip);

        debounceDispatch(sendStoryline());

        return oboe.drop;
      })
      .done(function() {
        debounceDispatch(function() {
          dispatch(sendStoryline());

          setTimeout(function() {
            dispatch(doneStorylineRequest());
          }, 400);
        });
      })
      .fail(error => dispatch(failedStorylineRequest(error)));
  }
}

export function doneStorylineRequest() {
  return function(dispatch) {
    dispatch({ type: DONE_STORYLINE_REQUEST });
    dispatch(fitPlaces());
  };
}

export function failedStorylineRequest(error) {
  return { type: FAILED_STORYLINE_REQUEST, error };
}