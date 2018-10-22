import fetch, { IFetchOptions } from '../utils/fetch';
import { IPlaceData } from './Place';
import { IStayData } from './Stay';
import { ITripData } from './Trip';

export type DiaryData = Array<{
  place?: IPlaceData;
  stay?: IStayData;
  trip?: ITripData;
}>;

let demoDataCache: DiaryData | undefined;

export function fetchDemoDiary(options?: RequestInit & IFetchOptions): Promise<DiaryData> {
  if (demoDataCache != null) {
    return Promise.resolve(demoDataCache);
  }

  return fetch(`/static/data/demo.json`, options)
    .then((response: Response) => response.json())
    .then((data: DiaryData) => {
      demoDataCache = data;

      return data;
    });
}
