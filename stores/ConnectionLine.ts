import { LineUtil, Point } from 'leaflet';
import { computed, makeObservable } from 'mobx';

import Connection from './Connection';
import PlaceCircle from './PlaceCircle';
import { VIEW } from './UIStore';
import roundPoint from './utils/roundPoint';
import VisualisationStore from './VisualisationStore';
import ConnectionLineLabel from './ConnectionLineLabel';

const roundConnectionLinePoint = roundPoint(0.2);

class ConnectionLine {
  readonly connections: Connection[] = [];
  readonly label: ConnectionLineLabel;

  constructor(
    readonly vis: VisualisationStore,
    readonly key: string,
    readonly from: PlaceCircle,
    readonly to: PlaceCircle
  ) {
    this.label = new ConnectionLineLabel(vis, this);

    makeObservable(this, {
      visibleFrequency: computed,
      visibleDistance: computed,
      visibleDuration: computed,
      beeline: computed,
      viewLength: computed,
      visible: computed,
      active: computed,
      highlight: computed,
      fade: computed,
      strokeWidth: computed,
      placeCircleCistance: computed,

      placeCircleVector: computed<Point>({
        equals(a, b) {
          return a.equals(b);
        },
      }),

      fromPlaceCircleEdge: computed<Point | null>({
        equals(a, b) {
          return a != null && b != null && a.equals(b);
        },
      }),

      toPlaceCircleEdge: computed<Point | null>({
        equals(a, b) {
          return a != null && b != null && a.equals(b);
        },
      }),

      clippedPoints: computed,
    });
  }

  get visibleFrequency() {
    return this.connections.reduce((frequency, connection) => frequency + connection.visibleFrequency, 0);
  }

  get visibleDistance() {
    return (
      this.connections.reduce((distance, connection) => distance + connection.visibleDistance, 0) /
      this.connections.length
    );
  }

  get visibleDuration() {
    return (
      this.connections.reduce((distance, connection) => distance + connection.visibleDuration, 0) /
      this.connections.length
    );
  }

  get beeline() {
    return this.from.mapPoint.distanceTo(this.to.mapPoint);
  }

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

  get visible() {
    return this.connections.some((connection) => connection.visible);
  }

  get active() {
    return this.vis.activeElement === this;
  }

  get highlight() {
    return this.active || this.from.active || this.to.active;
  }

  get fade() {
    return !this.highlight && this.vis.activeElement != null;
  }

  get strokeWidth() {
    return this.vis.connectionStrokeWidthScale(this.visibleFrequency);
  }

  get placeCircleCistance() {
    return this.to.point.distanceTo(this.from.point);
  }

  get placeCircleVector() {
    return this.to.point.subtract(this.from.point);
  }

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

  get toPlaceCircleEdge() {
    if (this.placeCircleCistance === 0) {
      return null;
    }

    return roundConnectionLinePoint(
      this.to.point.subtract(
        this.placeCircleVector.multiplyBy((this.to.radius + this.to.strokeWidth / 2 - 0.5) / this.placeCircleCistance)
      )
    );
  }

  get clippedPoints(): [Point, Point] | null {
    const { fromPlaceCircleEdge, toPlaceCircleEdge } = this;

    if (fromPlaceCircleEdge == null || toPlaceCircleEdge == null) {
      return null;
    }

    const { viewBounds } = this.vis;

    if (viewBounds == null) {
      return [fromPlaceCircleEdge, toPlaceCircleEdge];
    }

    const clippedLine = LineUtil.clipSegment(fromPlaceCircleEdge, toPlaceCircleEdge, viewBounds);

    return clippedLine === false ? null : clippedLine;
  }
}

export default ConnectionLine;
