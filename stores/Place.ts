import { latLng } from 'leaflet';
import { computed, makeObservable } from 'mobx';

import DataStore from './DataStore';

export interface IPlaceData {
  readonly id: number;
  readonly location: ILocation;
  readonly name: string;
}

export interface ILocation {
  readonly lat: number;
  readonly lon: number;
}

export function isPlaceData(value: any): value is IPlaceData {
  return value.id != null && value.location != null && value.name != null;
}

class Place {
  readonly store: DataStore;
  readonly id: number;
  readonly location: ILocation;
  readonly name: string;

  constructor(store: DataStore, data: IPlaceData) {
    makeObservable(this, {
      latLng: computed,
      stays: computed,
      visibleStays: computed,
      duration: computed,
      visibleDuration: computed,
      frequency: computed,
      visibleFrequency: computed,
      visible: computed,
    });

    this.store = store;

    this.id = data.id;
    this.location = data.location;
    this.name = data.name;
  }

  get latLng() {
    const { lat, lon } = this.location;

    return latLng({ lat, lng: lon });
  }

  get stays() {
    return this.store.stays.filter((stay) => stay.at === this);
  }

  get visibleStays() {
    return this.stays.filter((stay) => stay.visible);
  }

  get duration() {
    return this.stays.reduce((duration, stay) => duration + stay.duration, 0);
  }

  get visibleDuration() {
    return this.visibleStays.reduce((duration, stay) => duration + stay.duration, 0);
  }

  get frequency() {
    return this.stays.length;
  }

  get visibleFrequency() {
    return this.visibleStays.length;
  }

  get visible() {
    return this.visibleStays.length > 0;
  }
}

export default Place;
