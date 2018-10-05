import { computed } from 'mobx';

import { DiaryData } from './Diary';
import Place, { isPlaceData } from './Place';
import Stay, { isStayData } from './Stay';
import Trip, { isTripData } from './Trip';
import Connection from './Connection';
import UIStore from './UIStore';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

class DataStore {
  readonly places: Place[] = [];
  readonly stays: Stay[] = [];
  readonly trips: Trip[] = [];
  readonly connections: Connection[];
  readonly timeSpan: [number, number];
  readonly ui: UIStore;

  constructor(ui: UIStore, data: DiaryData) {
    this.ui = ui;

    data.forEach(item => {
      if (item.place != null && isPlaceData(item.place)) {
        this.places.push(new Place(this, item.place));
      } else if (item.stay != null && isStayData(item.stay)) {
        this.stays.push(new Stay(this, item.stay));
      } else if (item.trip != null && isTripData(item.trip)) {
        this.trips.push(new Trip(this, item.trip));
      } else {
        throw new Error('Unknown data item.');
      }
    });

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

    this.connections = Object.values(connections);

    this.timeSpan = this.stays.reduce<[number, number]>(
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
