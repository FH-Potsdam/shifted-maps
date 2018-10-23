import { scaleLinear, scalePow } from 'd3-scale';
import { CRS as LeafletCRS, LatLng, latLngBounds, Map as LeafletMap, Point } from 'leaflet';
import debounce from 'lodash/fp/debounce';
import reverse from 'lodash/fp/reverse';
import { action, computed, observable } from 'mobx';

import {
  createConnectionStrokeWidthRangeScale,
  createPlaceRadiusRangeScale,
  createPlaceStrokeWidthRangeScale,
  MAX_ZOOM,
} from './config';
import Connection from './Connection';
import ConnectionLine from './ConnectionLine';
import DataStore from './DataStore';
import GraphStore from './GraphStore';
import PlaceCircle from './PlaceCircle';
import PlaceCircleNode from './PlaceCircleNode';
import UIStore from './UIStore';
import extent from './utils/extent';
import sortVisualisationElements from './utils/sortVisualisationElements';

export type VisualisationElement = PlaceCircle | ConnectionLine;

class VisualisationStore {
  readonly data: DataStore;
  readonly ui: UIStore;
  readonly graph: GraphStore;

  @observable
  pixelOrigin?: Point;

  @observable
  zoom?: number;

  @observable
  activeElement: VisualisationElement | null = null;

  @observable
  width?: number;

  @observable
  maxPlaceCircleRadius?: number;

  toggle = debounce(50)(
    action((element: VisualisationElement, active: boolean = !element.active) => {
      this.activeElement = active ? element : null;
    })
  );

  private placeCirclesCache: PlaceCircle[] = [];
  private connectionLinesCache: ConnectionLine[] = [];

  @observable
  private crs?: LeafletCRS;

  @observable
  private minZoom?: number;

  @observable
  private maxZoom?: number;

  constructor(ui: UIStore, data: DataStore) {
    this.ui = ui;
    this.data = data;

    this.graph = new GraphStore(this, this.handleGraphTick, this.handleGraphEnd);
  }

  @action
  handleGraphTick = (nodes: PlaceCircleNode[]) => {
    nodes.forEach(node => {
      node.placeCircle.graphPoint = node.clone();
    });
  };

  @action
  handleGraphEnd = (nodes: PlaceCircleNode[]) => {
    nodes.forEach(node => {
      node.placeCircle.graphPoint = node.round();
    });
  };

  @action
  updateMap(map?: LeafletMap) {
    if (map == null) {
      return;
    }

    this.crs = map.options.crs;
    this.zoom = map.getZoom();
    this.minZoom = map.getMinZoom();
    this.maxZoom = Math.min(MAX_ZOOM, map.getMaxZoom());

    const pixelOrigin = map.getPixelOrigin();

    if (this.pixelOrigin == null || !this.pixelOrigin.equals(pixelOrigin)) {
      this.pixelOrigin = pixelOrigin;
    }
  }

  @action
  updateWidth(width: number) {
    this.width = width;

    let maxPlaceCircleRadius = createPlaceRadiusRangeScale(width).range()[1][1];

    if (this.maxPlaceCircleRadius != null) {
      maxPlaceCircleRadius = Math.max(maxPlaceCircleRadius, this.maxPlaceCircleRadius);
    }

    this.maxPlaceCircleRadius = Math.ceil(maxPlaceCircleRadius);
  }

  @action
  deactivateElement() {
    this.activeElement = null;
  }

  dispose() {
    this.graph.dispose();
  }

  @computed
  get ready() {
    return this.pixelOrigin != null && this.zoom != null && this.width != null;
  }

  @computed
  get zoomScale() {
    if (this.maxZoom == null || this.minZoom == null) {
      return;
    }

    return scaleLinear().domain([this.minZoom, this.maxZoom]);
  }

  @computed
  get scale() {
    if (this.zoomScale == null || this.zoom == null) {
      return;
    }

    return this.zoomScale(this.zoom);
  }

  @computed
  get placeCircles() {
    const placeCircles: PlaceCircle[] = [];

    this.data.places.forEach(place => {
      let placeCircle = this.placeCirclesCache.find(placeCircle => placeCircle.place === place);

      if (placeCircle == null) {
        placeCircle = new PlaceCircle(this, place);
      }

      placeCircles.push(placeCircle);
    });

    return (this.placeCirclesCache = placeCircles);
  }

  @computed
  get connectionLines() {
    const connectionLines: ConnectionLine[] = [];

    // Clear all connections to start with empty connection lines if reused.
    this.connectionLinesCache.forEach(connectionLine => {
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
        connectionLine = this.connectionLinesCache.find(
          connectionLine => connectionLine.key === key
        );
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

    return (this.connectionLinesCache = connectionLines);
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
  get elements() {
    return sortVisualisationElements([...this.placeCircles, ...this.connectionLines]);
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
    const domain = extent('visibleFrequency')(this.data.visiblePlaces);

    const scale = scalePow()
      .exponent(0.5)
      .domain(domain);

    if (this.scale != null) {
      if (this.width == null) {
        throw new Error('Width unknown.');
      }

      const range = createPlaceStrokeWidthRangeScale(this.width)(this.scale);

      scale.range(range);
    }

    return scale;
  }

  @computed
  get placeCircleRadiusScale() {
    const domain = extent('visibleDuration')(this.data.visiblePlaces);

    const scale = scalePow()
      .exponent(0.5)
      .domain(domain);

    if (this.scale != null) {
      if (this.width == null) {
        throw new Error('Width unknown.');
      }

      const range = createPlaceRadiusRangeScale(this.width)(this.scale);

      scale.range(range);
    }

    return scale;
  }

  @computed
  get connectionStrokeWidthScale() {
    const domain = this.connectionLineFrequencyDomain;

    const scale = scalePow()
      .exponent(0.25)
      .domain(domain);

    if (this.scale != null) {
      if (this.width == null) {
        throw new Error('Width unknown.');
      }

      let range = createConnectionStrokeWidthRangeScale(this.width)(this.scale);

      // In case there is only one connection line, make the higher range the default stroke width.
      if (domain[0] === domain[1]) {
        range = [range[1], range[1]];
      }

      scale.range(range);
    }

    return scale;
  }

  @computed
  get connectionLineDistanceDomain() {
    return extent('visibleDistance')(this.visibleConnectionLines);
  }

  @computed
  get connectionLineDurationDomain() {
    return extent('visibleDuration')(this.visibleConnectionLines);
  }

  @computed
  get connectionLineFrequencyDomain() {
    return extent('visibleFrequency')(this.visibleConnectionLines);
  }

  @computed
  get connectionLineBeelineScale() {
    const beelineExtent = extent('beeline');

    return scaleLinear()
      .domain(beelineExtent(this.data.connections))
      .range(beelineExtent(this.connectionLines));
  }

  @computed
  get connectionLineDurationDistanceScale() {
    return scaleLinear()
      .domain(this.connectionLineDurationDomain)
      .range(this.connectionLineDistanceDomain);
  }

  @computed
  get connectionLineFrequencyDistanceScale() {
    return scaleLinear()
      .domain(reverse(this.connectionLineFrequencyDomain))
      .range(this.connectionLineDistanceDomain);
  }

  project(
    latLng: LatLng,
    zoom: number | undefined = this.zoom,
    pixelOrigin: Point | undefined = this.pixelOrigin
  ) {
    if (this.crs == null) {
      throw new Error('No CRS.');
    }

    if (zoom == null || pixelOrigin == null) {
      throw new Error('Cannot calculate point without zoom or pixel origin.');
    }

    return this.crs.latLngToPoint(latLng, zoom).subtract(pixelOrigin);
  }

  unproject(
    point: Point,
    zoom: number | undefined = this.zoom,
    pixelOrigin: Point | undefined = this.pixelOrigin
  ) {
    if (this.crs == null) {
      throw new Error('No CRS.');
    }

    if (zoom == null || pixelOrigin == null) {
      throw new Error('Cannot calculate latLng without zoom or pixel origin.');
    }

    return this.crs.pointToLatLng(point.add(pixelOrigin), zoom);
  }
}

export default VisualisationStore;
