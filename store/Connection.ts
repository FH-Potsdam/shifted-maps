import { computed } from 'mobx';
import moment from 'moment';

import Place from './Place';
import Trip from './Trip';
import DataStore from './DataStore';
import { VIEW } from './UIStore';

class Connection {
  readonly store: DataStore;
  readonly id: string;
  readonly from: Place;
  readonly to: Place;
  readonly trips: Trip[] = [];

  constructor(store: DataStore, id: string, from: Place, to: Place) {
    this.store = store;

    this.id = id;
    this.from = from;
    this.to = to;
  }

  static createId(from: Place, to: Place): string {
    if (from.id < to.id) {
      return `${from.id}-${to.id}`;
    }

    return this.createId(to, from);
  }

  @computed
  get visibleTrips() {
    return this.trips.filter(trip => trip.visible);
  }

  @computed
  get visible() {
    return this.visibleTrips.length > 0;
  }

  @computed
  get distance() {
    return (
      this.trips.reduce((distance, trip) => {
        return distance + trip.distance;
      }, 0) / this.trips.length
    );
  }

  @computed
  get visibleDistance() {
    return (
      this.visibleTrips.reduce((distance, trip) => {
        return distance + trip.distance;
      }, 0) / this.visibleTrips.length
    );
  }

  @computed
  get duration() {
    return this.trips.reduce((duration, trip) => {
      return duration + trip.duration;
    }, 0);
  }

  @computed
  get visibleDuration() {
    return this.visibleTrips.reduce((duration, trip) => {
      return duration + trip.duration;
    }, 0);
  }

  @computed
  get frequency() {
    return this.trips.length;
  }

  @computed
  get visibleFrequency() {
    return this.visibleTrips.length;
  }

  @computed
  get beeline() {
    return this.from.latLng.distanceTo(this.to.latLng);
  }

  @computed
  get label() {
    const { activeView } = this.store.ui;

    if (activeView === VIEW.GEOGRAPHIC) {
      if (this.visibleDistance >= 1000) {
        return `${Math.round(this.visibleDistance / 1000).toLocaleString()} km`;
      }

      return `${Math.round(this.visibleDistance).toLocaleString()} m`;
    }

    if (activeView === VIEW.FREQUENCY) {
      return `${this.visibleFrequency} ×`;
    }

    if (activeView === VIEW.DURATION) {
      return moment.duration(this.visibleDuration, 'seconds').humanize();
    }

    return null;
  }
}

export default Connection;
