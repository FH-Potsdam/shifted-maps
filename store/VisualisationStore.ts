import { observable, computed, action } from 'mobx';
import { Map as LeafletMap, latLngBounds, CRS as LeafletCRS } from 'leaflet';
import { scaleLinear, scalePow } from 'd3';
import reverse from 'lodash/fp/reverse';

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
import GraphStore, { PlaceCircleNode } from './GraphStore';

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

  private _graph?: GraphStore;
  private _placeCircles: PlaceCircle[] = [];
  private _connectionLines: ConnectionLine[] = [];

  @observable
  private _scale?: number;

  constructor(ui: UIStore, data: DataStore) {
    this.ui = ui;
    this.data = data;
  }

  @action
  update(map: LeafletMap) {
    const maxZoom = Math.min(MAX_ZOOM, map.getMaxZoom());
    const zoomScale = scaleLinear().domain([map.getMinZoom(), maxZoom]);

    this._scale = zoomScale(map.getZoom());

    if (this._graph == null) {
      this._graph = new GraphStore(this, this.handleGraphTick);
    }

    this._graph.update(map);

    this.placeCircles.forEach(placeCircle => {
      placeCircle.updateByMap(map);
    });
  }

  @action
  handleGraphTick = (nodes: PlaceCircleNode[]) => {
    nodes.forEach(node => {
      node.placeCircle.updateByGraphNode(node);
    });
  };

  @computed
  get placeCircles() {
    const placeCircles: PlaceCircle[] = [];

    this.data.places.forEach(place => {
      let placeCircle = this._placeCircles.find(placeCircle => placeCircle.place === place);

      if (placeCircle == null) {
        placeCircle = new PlaceCircle(this, place);
      }

      placeCircles.push(placeCircle);
    });

    return (this._placeCircles = placeCircles);
  }

  @computed
  get connectionLines() {
    const connectionLines: ConnectionLine[] = [];

    // Clear all connections to start with empty connection lines if reused.
    this._connectionLines.forEach(connectionLine => {
      connectionLine.connections.length = 0;
    });

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

      const key = Connection.createId(from.place, to.place);
      let connectionLine = connectionLines.find(connectionLine => connectionLine.key === key);
      let newConnectionLine = false;

      if (connectionLine == null) {
        connectionLine = this._connectionLines.find(connectionLine => connectionLine.key === key);
        newConnectionLine = true;
      }

      if (connectionLine == null) {
        connectionLine = new ConnectionLine(this, key, from, to);
        newConnectionLine = true;
      }

      if (newConnectionLine) {
        connectionLines.push(connectionLine);
      }

      connectionLine.connections.push(connection);
    });

    return (this._connectionLines = connectionLines);
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

    if (this._scale != null) {
      const range = PLACE_STROKE_WIDTH_RANGE_SCALE(this._scale);

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

    if (this._scale != null) {
      const range = PLACE_RADIUS_RANGE_SCALE(this._scale);

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

    if (this._scale != null) {
      let range = CONNECTION_STROKE_WIDTH_RANGE_SCALE(this._scale);

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
}

export default VisualisationStore;
