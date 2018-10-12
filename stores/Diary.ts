import fetch, { FetchOptions } from '../utils/fetch';
import { IPlaceData } from './Place';
import { IStayData } from './Stay';
import { ITripData } from './Trip';

export type DiaryData = Array<{
  place?: IPlaceData;
  stay?: IStayData;
  trip?: ITripData;
}>;

export function fetchDemoDiary(options?: RequestInit & FetchOptions): Promise<DiaryData> {
  return fetch(`/static/data/demo.json`, options).then((response: Response) => response.json());
}
