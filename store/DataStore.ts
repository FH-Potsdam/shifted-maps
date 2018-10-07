import { computed, action, observable } from 'mobx';

import { DiaryData } from './Diary';
import Place, { isPlaceData } from './Place';
import Stay, { isStayData } from './Stay';
import Trip, { isTripData } from './Trip';
import Connection from './Connection';
import UIStore from './UIStore';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

class DataStore {
  readonly ui: UIStore;

  @observable
  data?: DiaryData;

  constructor(ui: UIStore) {
    this.ui = ui;
  }

  @action
  update(data: DiaryData) {
    this.data = data;
  }

  @computed
  get places() {
    const places: Place[] = [];

    if (this.data == null) {
      return places;
    }

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

    if (this.data == null) {
      return stays;
    }

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

    if (this.data == null) {
      return trips;
    }

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
      if (trip.from === trip.to) {
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
  get timeSpan() {
    return this.stays.reduce<[number, number]>(
      ([start, end], stay: Stay) => {
        if (stay.startAt < start) {
          start = Math.floor(stay.startAt / DAY_IN_MS) * DAY_IN_MS;
        }

        if (stay.endAt > end) {
          end = Math.ceil(stay.endAt / DAY_IN_MS) * DAY_IN_MS;
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
}

export default DataStore;
