import { Point } from 'leaflet';
import { computed } from 'mobx';

import Connection from './Connection';
import PlaceCircle from './PlaceCircle';
import { VIEW } from './UIStore';
import roundPoint from './utils/roundPoint';
import VisualisationStore from './VisualisationStore';
import ConnectionLineLabel from './ConnectionLineLabel';

const roundConnectionLinePoint = roundPoint(0.2);

class ConnectionLine {
  readonly connections: Connection[] = [];
  readonly label: ConnectionLineLabel = new ConnectionLineLabel(this.vis, this);

  constructor(
    readonly vis: VisualisationStore,
    readonly key: string,
    readonly from: PlaceCircle,
    readonly to: PlaceCircle
  ) {}

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
  get beeline() {
    return this.from.mapPoint.distanceTo(this.to.mapPoint);
  }

  @computed
  get viewLength() {
    const { view } = this.vis.ui;

    if (view === VIEW.GEOGRAPHIC) {
      return this.vis.connectionLineBeelineScale(this.visibleDistance);
    }

    if (view === VIEW.DURATION) {
      const scaledDistance = this.vis.connectionLineDurationDistanceScale(this.visibleDuration);

      return this.vis.connectionLineBeelineScale(scaledDistance);
    }

    if (view === VIEW.FREQUENCY) {
      const scaledDistance = this.vis.connectionLineFrequencyDistanceScale(this.visibleFrequency);

      return this.vis.connectionLineBeelineScale(scaledDistance);
    }

    return this.beeline;
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
  get strokeWidth() {
    return this.vis.connectionStrokeWidthScale(this.visibleFrequency);
  }

  @computed
  get placeCircleCistance() {
    return this.to.point.distanceTo(this.from.point);
  }

  @computed<Point>({
    equals(a, b) {
      return a.equals(b);
    },
  })
  get placeCircleVector() {
    return this.to.point.subtract(this.from.point);
  }

  @computed<Point | null>({
    equals(a, b) {
      return a != null && b != null && a.equals(b);
    },
  })
  get fromPlaceCircleEdge() {
    if (this.placeCircleCistance === 0) {
      return null;
    }

    return roundConnectionLinePoint(
      this.from.point.add(
        this.placeCircleVector.multiplyBy(
          (this.from.radius + this.from.strokeWidth / 2 - 0.5) / this.placeCircleCistance
        )
      )
    );
  }

  @computed<Point | null>({
    equals(a, b) {
      return a != null && b != null && a.equals(b);
    },
  })
  get toPlaceCircleEdge() {
    if (this.placeCircleCistance === 0) {
      return null;
    }

    return roundConnectionLinePoint(
      this.to.point.subtract(
        this.placeCircleVector.multiplyBy(
          (this.to.radius + this.to.strokeWidth / 2 - 0.5) / this.placeCircleCistance
        )
      )
    );
  }
}

export default ConnectionLine;
