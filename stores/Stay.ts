import { computed, makeObservable } from 'mobx';

import DataStore from './DataStore';

export interface IStayData {
  readonly at: number;
  readonly duration: number;
  readonly endAt: number;
  readonly startAt: number;
}

export function isStayData(value: unknown): value is IStayData {
  return (
    typeof value === 'object' &&
    value != null &&
    'at' in value &&
    value.at != null &&
    'duration' in value &&
    value.duration != null &&
    'endAt' in value &&
    value.endAt != null &&
    'startAt' in value &&
    value.startAt != null
  );
}

class Stay {
  readonly store: DataStore;
  readonly atPlaceId: number;
  readonly duration: number;
  readonly endAt: number;
  readonly startAt: number;

  constructor(store: DataStore, data: IStayData) {
    makeObservable(this, {
      visible: computed,
      at: computed,
    });

    this.store = store;

    this.atPlaceId = data.at;
    this.duration = data.duration;
    this.endAt = data.endAt;
    this.startAt = data.startAt;
  }

  get visible() {
    const { timeSpan } = this.store.ui;

    if (timeSpan == null) {
      return true;
    }

    const [start, end] = timeSpan;

    return this.startAt >= start && this.endAt <= end;
  }

  get at() {
    return this.store.places.find((place) => place.id === this.atPlaceId);
  }
}

export default Stay;
