import oboe from 'oboe';
import moment from 'moment';
import { requestTiles } from './tiles';
import Place from '../models/place';
import Stay from '../models/stay';
import Trip from '../models/trip';

export const ADD_PLACE = 'ADD_PLACE';
export const ADD_STAY = 'ADD_STAY';
export const ADD_TRIP = 'ADD_TRIP';
export const REQUEST_STORYLINE = 'REQUEST_STORYLINE';
export const RECEIVE_STORYLINE = 'RECEIVE_STORYLINE';
export const FAIL_STORYLINE_REQUEST = 'FAIL_STORYLINE_REQUEST';

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
        stay.duration = moment(stay.endAt).diff(stay.startAt, 's');
        stay = new Stay(stay);

        stays.push(stay);
        dispatch(addStay(stay));

        return oboe.drop;
      })
      .node('trip', function(trip) {
        trip.duration = moment(trip.endAt).diff(trip.startAt, 's');
        trip = new Trip(trip);

        trips.push(trip);
        dispatch(addTrip(trip));

        return oboe.drop;
      })
      .done(() => dispatch(receiveStoryline(places, trips, stays)))
      .fail(error => dispatch(failStorylineRequest(error)));
  }
}

export function receiveStoryline(places, trips, stays) {
  return function(dispatch) {
    dispatch({ type: RECEIVE_STORYLINE, places, trips, stays});
    dispatch(requestTiles());
  };
}

export function failStorylineRequest(error) {
  return { type: FAIL_STORYLINE_REQUEST, error };
}