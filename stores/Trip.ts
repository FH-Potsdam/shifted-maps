import { computed } from 'mobx';

import DataStore from './DataStore';

export interface ITripData {
  readonly from: number;
  readonly to: number;
  readonly startAt: number;
  readonly endAt: number;
  readonly distance: number;
  readonly duration: number;
}

export function isTripData(value: any): value is ITripData {
  return (
    value.from != null &&
    value.to != null &&
    value.startAt != null &&
    value.endAt != null &&
    value.distance != null &&
    value.duration != null
  );
}

class Trip {
  public readonly store: DataStore;
  public readonly fromPlaceId: number;
  public readonly toPlaceId: number;
  public readonly startAt: number;
  public readonly endAt: number;
  public readonly distance: number;
  public readonly duration: number;

  constructor(store: DataStore, data: ITripData) {
    this.store = store;

    this.fromPlaceId = data.from;
    this.toPlaceId = data.to;
    this.startAt = data.startAt;
    this.endAt = data.endAt;
    this.distance = data.distance;
    this.duration = data.duration;
  }

  @computed
  get from() {
    return this.store.places.find(place => place.id === this.fromPlaceId);
  }

  @computed
  get to() {
    return this.store.places.find(place => place.id === this.toPlaceId);
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
}

export default Trip;
