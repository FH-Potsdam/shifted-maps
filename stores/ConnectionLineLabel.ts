import { bounds, point, Point } from 'leaflet';
import { action, computed, makeObservable, observableRef } from 'mobx';

import ConnectionLine from './ConnectionLine';
import { VIEW } from './UIStore';
import { formatDistance, formatDuration, formatFrequency } from './utils/formatLabel';
import roundPoint from './utils/roundPoint';
import VisualisationStore from './VisualisationStore';

const roundConnectionLinePoint = roundPoint(0.2);

class ConnectionLineLabel {
  size: Point | null = null;

  constructor(readonly vis: VisualisationStore, readonly connectionLine: ConnectionLine) {
    makeObservable(this, {
      size: observableRef,
      content: computed,
      highlight: computed,

      centerPoint: computed<Point | null>({
        equals(a, b) {
          return a != null && b != null && a.equals(b);
        },
      }),

      rotation: computed,
      pixelBounds: computed,
      intersectsViewBounds: computed,
      updateSize: action,
    });
  }

  updateSize(width: number, height: number) {
    const size = point(width, height);

    if (this.size == null || !this.size.equals(size)) {
      this.size = size;
    }
  }

  get content() {
    const { view } = this.vis.ui;

    if (view === VIEW.GEOGRAPHIC) {
      return formatDistance(this.connectionLine.visibleDistance);
    }

    if (view === VIEW.FREQUENCY) {
      return formatFrequency(this.connectionLine.visibleFrequency);
    }

    if (view === VIEW.DURATION) {
      return formatDuration(this.connectionLine.visibleDuration);
    }

    return null;
  }

  get highlight() {
    return this.connectionLine.highlight;
  }

  get centerPoint() {
    const { fromPlaceCircleEdge, toPlaceCircleEdge } = this.connectionLine;

    if (fromPlaceCircleEdge == null || toPlaceCircleEdge == null) {
      return null;
    }

    return roundConnectionLinePoint(
      fromPlaceCircleEdge.add(toPlaceCircleEdge.subtract(fromPlaceCircleEdge).divideBy(2))
    );
  }

  get rotation() {
    const { placeCircleVector } = this.connectionLine;

    let rotation = (Math.atan2(placeCircleVector.y, placeCircleVector.x) * 180) / Math.PI;

    if (rotation > 90) {
      rotation -= 180;
    } else if (rotation < -90) {
      rotation += 180;
    }

    return rotation;
  }

  get pixelBounds() {
    const { centerPoint } = this;
    const { size } = this;

    if (centerPoint == null || size == null) {
      return null;
    }

    const radians = (this.rotation * Math.PI) / 180;
    const cosine = Math.abs(Math.cos(radians));
    const sine = Math.abs(Math.sin(radians));
    const halfWidth = size.x / 2;
    const halfHeight = size.y / 2;
    const extentX = cosine * halfWidth + sine * halfHeight;
    const extentY = sine * halfWidth + cosine * halfHeight;

    return bounds(
      point(centerPoint.x - extentX, centerPoint.y - extentY),
      point(centerPoint.x + extentX, centerPoint.y + extentY)
    );
  }

  get intersectsViewBounds() {
    const { pixelBounds } = this;
    const { viewBounds } = this.vis;

    return pixelBounds != null && (viewBounds == null || viewBounds.intersects(pixelBounds));
  }
}

export default ConnectionLineLabel;
