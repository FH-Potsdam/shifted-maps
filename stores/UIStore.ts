import { action, observable } from 'mobx';

export enum VIEW {
  GEOGRAPHIC,
  DURATION,
  FREQUENCY,
}

class UIStore {
  @observable
  timeSpan?: ReadonlyArray<number>;

  @observable
  view?: VIEW;

  @action
  update({ view, timeSpan }: { timeSpan?: ReadonlyArray<number>; view?: VIEW }) {
    this.view = view;
    this.timeSpan = timeSpan;
  }
}

export default UIStore;
