import { action, observable, makeObservable } from 'mobx';

export enum VIEW {
  GEOGRAPHIC,
  DURATION,
  FREQUENCY,
}

class UIStore {
  timeSpan: ReadonlyArray<number> | undefined = undefined;

  view: VIEW | undefined = undefined;

  constructor() {
    makeObservable(this, {
      timeSpan: observable,
      view: observable,
      update: action,
    });
  }

  update({ view, timeSpan }: { timeSpan?: ReadonlyArray<number>; view?: VIEW }) {
    this.view = view;
    this.timeSpan = timeSpan;
  }
}

export default UIStore;
