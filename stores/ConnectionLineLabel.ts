import { Point } from 'leaflet';
import { computed } from 'mobx';

import ConnectionLine from './ConnectionLine';
import { VIEW } from './UIStore';
import { formatDistance, formatDuration, formatFrequency } from './utils/formatLabel';
import roundPoint from './utils/roundPoint';
import VisualisationStore from './VisualisationStore';

const roundConnectionLinePoint = roundPoint(0.2);

class ConnectionLineLabel {
  constructor(readonly vis: VisualisationStore, readonly connectionLine: ConnectionLine) {}

  @computed
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

  @computed
  get highlight() {
    return this.connectionLine.highlight;
  }

  @computed<Point | null>({
    equals(a, b) {
      return a != null && b != null && a.equals(b);
    },
  })
  get centerPoint() {
    const { fromPlaceCircleEdge, toPlaceCircleEdge } = this.connectionLine;

    if (fromPlaceCircleEdge == null || toPlaceCircleEdge == null) {
      return null;
    }

    return roundConnectionLinePoint(
      fromPlaceCircleEdge.add(toPlaceCircleEdge.subtract(fromPlaceCircleEdge).divideBy(2))
    );
  }

  @computed
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
}

export default ConnectionLineLabel;
