import { PlaceData } from './Place';
import { StayData } from './Stay';
import { TripData } from './Trip';
import fetch, { FetchOptions } from '../utils/fetch';

export type DiaryData = {
  place?: PlaceData;
  stay?: StayData;
  trip?: TripData;
}[];

export function fetchDemoDiary(options?: RequestInit & FetchOptions): Promise<DiaryData> {
  return fetch(`/static/data/demo.json`, options).then(response => response.json());
}
