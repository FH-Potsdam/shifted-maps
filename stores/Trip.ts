import { computed, makeObservable } from 'mobx';

import DataStore from './DataStore';

export interface ITripData {
  readonly from: number;
  readonly to: number;
  readonly startAt: number;
  readonly endAt: number;
  readonly distance: number;
  readonly duration: number;
}

export function isTripData(value: unknown): value is ITripData {
  return (
    typeof value === 'object' &&
    value != null &&
    'from' in value &&
    value.from != null &&
    'to' in value &&
    value.to != null &&
    'startAt' in value &&
    value.startAt != null &&
    'endAt' in value &&
    value.endAt != null &&
    'distance' in value &&
    value.distance != null &&
    'duration' in value &&
    value.duration != null
  );
}

class Trip {
  readonly store: DataStore;
  readonly fromPlaceId: number;
  readonly toPlaceId: number;
  readonly startAt: number;
  readonly endAt: number;
  readonly distance: number;
  readonly duration: number;

  constructor(store: DataStore, data: ITripData) {
    makeObservable(this, {
      from: computed,
      to: computed,
      visible: computed,
    });

    this.store = store;

    this.fromPlaceId = data.from;
    this.toPlaceId = data.to;
    this.startAt = data.startAt;
    this.endAt = data.endAt;
    this.distance = data.distance;
    this.duration = data.duration;
  }

  get from() {
    const from = this.store.places.find((place) => place.id === this.fromPlaceId);

    if (from == null) {
      throw new Error('Missing place.');
    }

    return from;
  }

  get to() {
    const to = this.store.places.find((place) => place.id === this.toPlaceId);

    if (to == null) {
      throw new Error('Missing place.');
    }

    return to;
  }

  get visible() {
    const { timeSpan } = this.store.ui;

    if (timeSpan == null) {
      return true;
    }

    const [start, end] = timeSpan;

    return this.startAt >= start && this.endAt <= end;
  }
}

export default Trip;
