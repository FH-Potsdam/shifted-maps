import { computed } from 'mobx';

import Connection from './Connection';
import { DiaryData } from './Diary';
import Place, { isPlaceData } from './Place';
import Stay, { isStayData } from './Stay';
import Trip, { isTripData } from './Trip';
import UIStore from './UIStore';

export const DAY_IN_SEC = 60 * 60 * 24;

class DataStore {
  readonly ui: Readonly<UIStore>;
  readonly data: DiaryData;

  constructor(ui: UIStore, data: DiaryData) {
    this.ui = ui;
    this.data = data;
  }

  @computed
  get places() {
    const places: Place[] = [];

    this.data.forEach(item => {
      if (item.place != null && isPlaceData(item.place)) {
        places.push(new Place(this, item.place));
      }
    });

    return places;
  }

  @computed
  get stays() {
    const stays: Stay[] = [];

    this.data.forEach(item => {
      if (item.stay != null && isStayData(item.stay)) {
        stays.push(new Stay(this, item.stay));
      }
    });

    return stays;
  }

  @computed
  get trips() {
    const trips: Trip[] = [];

    this.data.forEach(item => {
      if (item.trip != null && isTripData(item.trip)) {
        trips.push(new Trip(this, item.trip));
      }
    });

    return trips;
  }

  @computed
  get connections() {
    const connections: { [id: string]: Connection } = {};

    this.trips.forEach(trip => {
      // Ignore trips where start and end is at the same place.
      if (trip.from === trip.to || trip.from.latLng.equals(trip.to.latLng)) {
        return;
      }

      // Ignore tips where a to or from properties are not been resolved
      if (trip.from == null || trip.to == null) {
        return;
      }

      const id = Connection.createId(trip.from, trip.to);
      let connection = connections[id];

      if (connection == null) {
        connection = new Connection(this, id, trip.from, trip.to);
        connections[id] = connection;
      }

      connection.trips.push(trip);
    });

    return Object.values(connections);
  }

  @computed
  get timeSpan(): ReadonlyArray<number> {
    return this.stays.reduce<[number, number]>(
      ([start, end], stay: Stay) => {
        if (stay.startAt < start) {
          start = Math.floor(stay.startAt / DAY_IN_SEC) * DAY_IN_SEC;
        }

        if (stay.endAt > end) {
          end = Math.ceil(stay.endAt / DAY_IN_SEC) * DAY_IN_SEC;
        }

        return [start, end];
      },
      [Infinity, -Infinity]
    );
  }

  @computed
  get visiblePlaces() {
    return this.places.filter(place => place.visible);
  }

  @computed
  get visibleConnections() {
    return this.connections.filter(connection => connection.visible);
  }

  @computed
  get totalConnectionDistance() {
    return this.visibleConnections.reduce((distance, connection) => {
      return distance + connection.totalVisibleDistance;
    }, 0);
  }

  @computed
  get averageConnectionDistance() {
    if (this.visibleConnections.length === 0) {
      return 0;
    }

    return this.totalConnectionDistance / this.visibleConnections.length;
  }

  @computed
  get totalConnectionDuration() {
    return this.visibleConnections.reduce((distance, connection) => {
      return distance + connection.totalVisibleDuration;
    }, 0);
  }

  @computed
  get averageConnectionDuration() {
    if (this.visibleConnections.length === 0) {
      return 0;
    }

    return this.totalConnectionDuration / this.visibleConnections.length;
  }

  @computed
  get totalConnectionFrequency() {
    return this.visibleConnections.reduce((distance, connection) => {
      return distance + connection.visibleFrequency;
    }, 0);
  }

  @computed
  get averageConnectionFrequency() {
    if (this.visibleConnections.length === 0) {
      return 0;
    }

    return this.totalConnectionFrequency / this.visibleConnections.length;
  }
}

export default DataStore;
