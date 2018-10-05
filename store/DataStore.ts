import { computed } from 'mobx';

import { DiaryData } from './Diary';
import Place, { isPlaceData } from './Place';
import Stay, { isStayData } from './Stay';
import Trip, { isTripData } from './Trip';
import Connection from './Connection';
import UIStore from './UIStore';

class DataStore {
  readonly places: Place[] = [];
  readonly stays: Stay[] = [];
  readonly trips: Trip[] = [];

  readonly ui: UIStore;

  constructor(data: DiaryData) {
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

    this.ui = new UIStore(this);
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
  get visiblePlaces() {
    return this.places.filter(place => place.visible);
  }

  @computed
  get visibleConnections() {
    return this.connections.filter(connection => connection.visible);
  }

  /*@computed
  get placeClusters() {
    const places: Place[] = this.sortedPlaces;
    const clusteredPlaces: { [id: string]: boolean } = {};
    const clusters: PlaceCluster[] = [];

    for (let placeA of places) {
      if (clusteredPlaces[placeA.id]) {
        continue;
      }

      const cluster = new PlaceCluster(this);

      cluster.places.push(placeA);
      clusteredPlaces[placeA.id] = true;

      for (let placeB of places) {
        if (clusteredPlaces[placeB.id]) {
          continue;
        }

        const distance = placeA.layerPoint.distanceTo(placeB.layerPoint);
        const maxDistance = placeA.radius + placeB.radius;

        if (distance > maxDistance) {
          continue;
        }

        const overlap = maxDistance - distance;

        if (overlap / (placeB.radius * 2) >= 0.6) {
          cluster.places.push(placeB);
          clusteredPlaces[placeB.id] = true;
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }*/
}

export default DataStore;
