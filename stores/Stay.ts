import { computed } from 'mobx';

import DataStore from './DataStore';

export interface IStayData {
  readonly at: number;
  readonly duration: number;
  readonly endAt: number;
  readonly startAt: number;
}

export function isStayData(value: any): value is IStayData {
  return value.at != null && value.duration != null && value.endAt != null && value.startAt != null;
}

class Stay {
  public readonly store: DataStore;
  public readonly atPlaceId: number;
  public readonly duration: number;
  public readonly endAt: number;
  public readonly startAt: number;

  constructor(store: DataStore, data: IStayData) {
    this.store = store;

    this.atPlaceId = data.at;
    this.duration = data.duration;
    this.endAt = data.endAt;
    this.startAt = data.startAt;
  }

  @computed
  get visible() {
    const { timeSpan } = this.store.ui;

    if (timeSpan == null) {
      return true;
    }

    const [start, end] = timeSpan;

    return this.startAt >= start && this.endAt <= end;
  }

  @computed
  get at() {
    return this.store.places.find(place => place.id === this.atPlaceId);
  }
}

export default Stay;
