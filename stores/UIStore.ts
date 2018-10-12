import { action, observable } from 'mobx';

export enum VIEW {
  GEOGRAPHIC,
  DURATION,
  FREQUENCY,
}

class UIStore {
  @observable
  public timeSpan?: [number, number];

  @observable
  public view?: VIEW;

  @action
  public update({ view, timeSpan }: { timeSpan?: [number, number]; view?: VIEW }) {
    this.view = view;
    this.timeSpan = timeSpan;
  }
}

export default UIStore;
