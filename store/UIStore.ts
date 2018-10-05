import DataStore from './DataStore';
import { computed, action } from 'mobx';
import Stay from './Stay';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export enum VIEW {
  GEOGRAPHIC,
  FREQUENCY,
  DURATION,
}

class UIStore {
  readonly store: DataStore;
  activeTimeSpan?: [number, number];
  activeView?: VIEW;

  constructor(store: DataStore) {
    this.store = store;
  }

  @computed
  get overallTimeSpan() {
    return this.store.stays.reduce(
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

  @action
  changeTimeSpan(activeTimeSpan: [number, number]) {
    this.activeTimeSpan = activeTimeSpan;
  }

  @action
  changeView(view: VIEW) {
    this.activeView = view;
  }
}

export default UIStore;
