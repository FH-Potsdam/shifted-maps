import fetch, { FetchOptions } from '../utils/fetch';
import { PlaceData } from './Place';
import { StayData } from './Stay';
import { TripData } from './Trip';

export type DiaryData = Array<{
  place?: PlaceData;
  stay?: StayData;
  trip?: TripData;
}>;

export function fetchDemoDiary(options?: RequestInit & FetchOptions): Promise<DiaryData> {
  return fetch(`/static/data/demo.json`, options).then((response: Response) => response.json());
}
