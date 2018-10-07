import { observable, computed, action, autorun } from 'mobx';
import { Map as LeafletMap, latLngBounds, CRS as LeafletCRS } from 'leaflet';
import { scaleLinear, scalePow } from 'd3';
import reverse from 'lodash/fp/reverse';
import { keepAlive } from 'mobx-utils';

import DataStore from './DataStore';
import PlaceCircle, { sortByHoverRadius } from './PlaceCircle';
import ConnectionLine, {
  sortByHoverStrokeWidth,
  visibleDistanceExtent as visibleConnectionLineDistanceExtent,
  visibleDurationExtent as visibleConnectionLineDurationExtent,
  visibleFrequencyExtent as visibleConnectionLineFrequencyExtent,
  lengthExtent as connectionLineLengthExtent,
} from './ConnectionLine';
import Connection from './Connection';
import UIStore from './UIStore';
import {
  visibleFrequencyExtent as visiblePlaceFrequencyExtent,
  visibleDurationExtent as visiblePlaceDurationExtent,
} from './Place';
import GraphStore from './GraphStore';

export const MAX_ZOOM = 18;
export const CRS = LeafletCRS.EPSG3857;

const PLACE_STROKE_WIDTH_RANGE_SCALE = scalePow<[number, number]>()
  .exponent(2)
  .range([[1, 5], [4, 20]]);

const PLACE_RADIUS_RANGE_SCALE = scalePow<[number, number]>()
  .exponent(2)
  .range([[10, 50], [50, 300]]);

const CONNECTION_STROKE_WIDTH_RANGE_SCALE = scalePow<[number, number]>()
  .exponent(2)
  .range([[0.5, 5], [1, 10]]);

class VisualisationStore {
  readonly data: DataStore;
  readonly ui: UIStore;
  readonly graph: GraphStore;

  @observable
  scale?: number;

  @observable
  animate: boolean = false;

  constructor(ui: UIStore, data: DataStore) {
    this.ui = ui;
    this.data = data;
    this.graph = new GraphStore(this);

    keepAlive(this, 'placeCircles');
  }

  @action
  update(map: LeafletMap) {
    const maxZoom = Math.min(MAX_ZOOM, map.getMaxZoom());
    const zoomScale = scaleLinear().domain([map.getMinZoom(), maxZoom]);

    this.scale = zoomScale(map.getZoom());

    this.placeCircles.forEach(placeCircle => {
      placeCircle.update(map);
    });

    this.toggleAnimate(false);
  }

  @computed
  get placeCircles() {
    return this.data.places.map(place => new PlaceCircle(this, place));
  }

  @computed
  get initialBounds() {
    const emptyBounds = latLngBounds([]);

    if (this.data.places.length === 0) {
      return emptyBounds;
    }

    return this.data.places
      .reduce((bounds, place) => {
        bounds.extend(place.latLng);

        return bounds;
      }, emptyBounds)
      .pad(0.1);
  }

  @action
  toggleAnimate(animate: boolean = !this.animate) {
    this.animate = animate;
  }

  @computed
  get sortedPlaceCircles() {
    return sortByHoverRadius(this.placeCircles);
  }

  @computed
  get sortedConnectionLines() {
    return sortByHoverStrokeWidth(this.connectionLines);
  }

  @computed
  get visiblePlaceCircles() {
    return this.placeCircles.filter(placeCircle => placeCircle.visible);
  }

  @computed
  get visibleConnectionLines() {
    return this.connectionLines.filter(connectionLines => connectionLines.visible);
  }

  @computed
  get placeStrokeWidthScale() {
    const domain = visiblePlaceFrequencyExtent(this.data.visiblePlaces);

    const scale = scalePow()
      .exponent(0.5)
      .domain(domain);

    if (this.scale != null) {
      const range = PLACE_STROKE_WIDTH_RANGE_SCALE(this.scale);

      scale.rangeRound(range);
    }

    return scale;
  }

  @computed
  get placeRadiusScale() {
    const domain = visiblePlaceDurationExtent(this.data.visiblePlaces);

    const scale = scalePow()
      .exponent(0.5)
      .domain(domain);

    if (this.scale != null) {
      const range = PLACE_RADIUS_RANGE_SCALE(this.scale);

      scale.rangeRound(range);
    }

    return scale;
  }

  @computed
  get connectionDistanceDomain() {
    return visibleConnectionLineDistanceExtent(this.visibleConnectionLines);
  }

  @computed
  get connectionDurationDomain() {
    return visibleConnectionLineDurationExtent(this.visibleConnectionLines);
  }

  @computed.struct
  get connectionFrequencyDomain() {
    return visibleConnectionLineFrequencyExtent(this.visibleConnectionLines);
  }

  @computed
  get connectionStrokeWidthScale() {
    const domain = this.connectionFrequencyDomain;

    const scale = scalePow()
      .exponent(0.25)
      .domain(domain);

    if (this.scale != null) {
      let range = CONNECTION_STROKE_WIDTH_RANGE_SCALE(this.scale);

      // In case there is only one connection line, make the higher range the default stroke width.
      if (domain[0] === domain[1]) {
        range = [range[1], range[1]];
      }

      scale.range(range);
    }

    return scale;
  }

  @computed
  get connectionLengthScale() {
    return scaleLinear().range(connectionLineLengthExtent(this.visibleConnectionLines));
  }

  @computed
  get connectionDistanceLengthScale() {
    return this.connectionLengthScale.copy().domain(this.connectionDistanceDomain);
  }

  @computed
  get connectionDurationLengthScale() {
    return this.connectionLengthScale.copy().domain(this.connectionDurationDomain);
  }

  @computed
  get connectionFrequencyLengthScale() {
    return this.connectionLengthScale.copy().domain(reverse(this.connectionFrequencyDomain));
  }

  @computed
  get connectionLines() {
    const connectionLines: { [id: string]: ConnectionLine } = {};

    this.data.connections.forEach(connection => {
      let from = this.placeCircles.find(placeCircle => placeCircle.place === connection.from);
      let to = this.placeCircles.find(placeCircle => placeCircle.place === connection.to);

      if (from == null || to == null) {
        throw new Error('Missing place circle');
      }

      if (from.parent != null) {
        from = from.parent;
      }

      if (to.parent != null) {
        to = to.parent;
      }

      // Link inside a place cluster
      if (from.place === to.place) {
        return;
      }

      const id = Connection.createId(from.place, to.place);
      let connectionLine = connectionLines[id];

      if (connectionLine == null) {
        connectionLine = new ConnectionLine(this, id, from, to);
        connectionLines[id] = connectionLine;
      }

      connectionLine.connections.push(connection);
    });

    return Object.values(connectionLines);
  }
}

export default VisualisationStore;
