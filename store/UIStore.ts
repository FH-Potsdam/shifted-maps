import { action, observable, computed } from 'mobx';

export enum VIEW {
  GEOGRAPHIC,
  DURATION,
  FREQUENCY,
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
