import { computed } from 'mobx';

import DataStore from './DataStore';

export type StayData = {
  readonly at: number;
  readonly duration: number;
  readonly endAt: number;
  readonly startAt: number;
};

export function isStayData(value: any): value is StayData {
  return value.at != null && value.duration != null && value.endAt != null && value.startAt != null;
}

class Stay {
  readonly store: DataStore;
  readonly atPlaceId: number;
  readonly duration: number;
  readonly endAt: number;
  readonly startAt: number;

  constructor(store: DataStore, data: StayData) {
    this.store = store;

    this.atPlaceId = data.at;
    this.duration = data.duration;
    this.endAt = data.endAt;
    this.startAt = data.startAt;
  }

  @computed
  get visible() {
    const { activeTimeSpan } = this.store.ui;

    if (activeTimeSpan == null) {
      return true;
    }

    const [start, end] = activeTimeSpan;

    return this.startAt >= start && this.endAt <= end;
  }

  @computed
  get at() {
    return this.store.places.find(place => place.id === this.atPlaceId);
  }
}

export default Stay;
