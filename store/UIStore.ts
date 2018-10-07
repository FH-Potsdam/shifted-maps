import { action, observable } from 'mobx';
import { LatLngBounds } from 'leaflet';

export enum VIEW {
  GEOGRAPHIC,
  FREQUENCY,
  DURATION,
}

class UIStore {
  @observable
  timeSpan?: [number, number];

  @observable
  view?: VIEW;

  @action
  update({ view, timeSpan }: { timeSpan?: [number, number]; view?: VIEW }) {
    this.view = view;
    this.timeSpan = timeSpan;
  }
}

export default UIStore;
