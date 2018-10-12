import { latLng } from 'leaflet';
import { computed } from 'mobx';

import DataStore from './DataStore';
import extent from './utils/extent';

export interface PlaceData {
  readonly id: number;
  readonly location: Location;
  readonly name: string;
}

export interface Location {
  readonly lat: number;
  readonly lon: number;
}

export function isPlaceData(value: any): value is PlaceData {
  return value.id != null && value.location != null && value.name != null;
}

export const visibleFrequencyExtent = extent<Place>('visibleFrequency');
export const visibleDurationExtent = extent<Place>('visibleDuration');

class Place {
  public readonly store: DataStore;
  public readonly id: number;
  public readonly location: Location;
  public readonly name: string;

  constructor(store: DataStore, data: PlaceData) {
    this.store = store;

    this.id = data.id;
    this.location = data.location;
    this.name = data.name;
  }

  @computed
  get latLng() {
    const { lat, lon } = this.location;

    return latLng({ lat, lng: lon });
  }

  @computed
  get stays() {
    return this.store.stays.filter(stay => stay.at === this);
  }

  @computed
  get visibleStays() {
    return this.stays.filter(stay => stay.visible);
  }

  @computed
  get duration() {
    return this.stays.reduce((duration, stay) => duration + stay.duration, 0);
  }

  @computed
  get visibleDuration() {
    return this.visibleStays.reduce((duration, stay) => duration + stay.duration, 0);
  }

  @computed
  get frequency() {
    return this.stays.length;
  }

  @computed
  get visibleFrequency() {
    return this.visibleStays.length;
  }

  @computed
  get visible() {
    return this.visibleStays.length > 0;
  }
}

export default Place;
