import { action, observable } from 'mobx';

export enum VIEW {
  GEOGRAPHIC,
  FREQUENCY,
  DURATION,
}

class UIStore {
  @observable
  activeTimeSpan?: [number, number];

  @observable
  activeView: VIEW | null = null;

  @action
  changeTimeSpan(activeTimeSpan: [number, number]) {
    this.activeTimeSpan = activeTimeSpan;
  }

  @action
  toggleView(view: VIEW) {
    if (this.activeView === view) {
      this.activeView = null;
    } else {
      this.activeView = view;
    }
  }
}

export default UIStore;
