import orderBy from 'lodash/fp/orderBy';
import { computed } from 'mobx';

import Connection from './Connection';
import PlaceCircle from './PlaceCircle';
import { VIEW } from './UIStore';
import extent from './utils/extent';
import { formatDistance, formatDuration, formatFrequency } from './utils/formatLabel';
import VisualisationStore from './VisualisationStore';

export const sortByHoverStrokeWidth = orderBy<ConnectionLine>(['hover', 'radius'], ['asc', 'asc']);

export const visibleDistanceExtent = extent<ConnectionLine>('visibleDistance');
export const visibleDurationExtent = extent<ConnectionLine>('visibleDuration');
export const visibleFrequencyExtent = extent<ConnectionLine>('visibleFrequency');
export const lengthExtent = extent<ConnectionLine>('length');

class ConnectionLine {
  readonly vis: VisualisationStore;
  readonly from: PlaceCircle;
  readonly to: PlaceCircle;
  readonly connections: Connection[] = [];
  readonly key: string;

  constructor(vis: VisualisationStore, key: string, from: PlaceCircle, to: PlaceCircle) {
    this.vis = vis;
    this.key = key;
    this.from = from;
    this.to = to;
  }

  @computed
  get visibleFrequency() {
    return this.connections.reduce(
      (frequency, connection) => frequency + connection.visibleFrequency,
      0
    );
  }

  @computed
  get visibleDistance() {
    return (
      this.connections.reduce((distance, connection) => distance + connection.visibleDistance, 0) /
      this.connections.length
    );
  }

  @computed
  get visibleDuration() {
    return (
      this.connections.reduce((distance, connection) => distance + connection.visibleDuration, 0) /
      this.connections.length
    );
  }

  @computed
  get length() {
    return this.from.mapPoint.distanceTo(this.to.mapPoint);
  }

  @computed
  get viewLength() {
    const { view } = this.vis.ui;

    if (view === VIEW.GEOGRAPHIC) {
      return this.vis.connectionDistanceLengthScale(this.visibleDistance);
    }

    if (view === VIEW.DURATION) {
      return this.vis.connectionDurationLengthScale(this.visibleDuration);
    }

    if (view === VIEW.FREQUENCY) {
      return this.vis.connectionFrequencyLengthScale(this.visibleFrequency);
    }

    return this.length;
  }

  @computed
  get visible() {
    return this.connections.some(connection => connection.visible);
  }

  @computed
  get active() {
    return this.vis.activeElement === this;
  }

  @computed
  get highlight() {
    return this.active || this.from.active || this.to.active;
  }

  @computed
  get fade() {
    return !this.highlight && this.vis.activeElement != null;
  }

  @computed
  get label() {
    const { view } = this.vis.ui;

    if (view === VIEW.GEOGRAPHIC) {
      return formatDistance(this.visibleDistance);
    }

    if (view === VIEW.FREQUENCY) {
      return formatFrequency(this.visibleFrequency);
    }

    if (view === VIEW.DURATION) {
      return formatDuration(this.visibleDuration);
    }

    return null;
  }

  @computed
  get strokeWidth() {
    return this.vis.connectionStrokeWidthScale(this.visibleFrequency);
  }
}

export default ConnectionLine;
