import { latLng } from 'leaflet';
import { computed } from 'mobx';
import sortBy from 'lodash/fp/sortBy';

import DataStore from './DataStore';

export type PlaceData = {
  readonly id: number;
  readonly location: Location;
  readonly name: string;
};

export type Location = {
  readonly lat: number;
  readonly lon: number;
};

export function isPlaceData(value: any): value is PlaceData {
  return value.id != null && value.location != null && value.name != null;
}

export const sortByHover = sortBy<Place>('hover');

class Place {
  readonly store: DataStore;
  readonly id: number;
  readonly location: Location;
  readonly name: string;

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
