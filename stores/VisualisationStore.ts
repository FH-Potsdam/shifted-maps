import { scaleLinear, scalePow } from 'd3-scale';
import { bounds, Bounds, CRS as LeafletCRS, LatLng, latLngBounds, Map as LeafletMap, point, Point } from 'leaflet';
import debounce from 'lodash/fp/debounce';
import isEqual from 'lodash/fp/isEqual';
import reverse from 'lodash/fp/reverse';
import { action, computed, makeObservable, observable, observableRef } from 'mobx';

import {
  createConnectionStrokeWidthRangeScale,
  createPlaceRadiusRangeScale,
  createPlaceStrokeWidthRangeScale,
  MAX_ZOOM,
  SVG_RENDER_PADDING,
} from './config';
import Connection from './Connection';
import ConnectionLine from './ConnectionLine';
import DataStore from './DataStore';
import GraphStore from './GraphStore';
import PlaceCircle from './PlaceCircle';
import PlaceCircleNode from './PlaceCircleNode';
import UIStore, { VIEW } from './UIStore';
import extent from './utils/extent';
import sortVisualisationElements from './utils/sortVisualisationElements';

export type VisualisationElement = PlaceCircle | ConnectionLine;

class VisualisationStore {
  readonly data: DataStore;
  readonly graph: GraphStore;
  readonly ui: Readonly<UIStore>;

  pixelOrigin: Point | undefined = undefined;

  zoom: number | undefined = undefined;

  activeElement: VisualisationElement | null = null;

  width: number | undefined = undefined;

  viewBounds: Bounds | undefined = undefined;

  maxPlaceCircleRadius: number | undefined = undefined;
  transitionConnectionLines: ConnectionLine[] = [];
  transitionConnectionOpacity = 0;

  toggle = debounce(50)(
    action((element: VisualisationElement, active: boolean = !element.active) => {
      this.activeElement = active ? element : null;
    })
  );

  private placeCirclesCache: PlaceCircle[] = [];
  private connectionLinesCache: ConnectionLine[] = [];

  private crs: LeafletCRS | undefined = undefined;

  private minZoom: number | undefined = undefined;

  private maxZoom: number | undefined = undefined;
  private uiInitialized = false;
  private previousConnectionLines?: Array<{
    connectionLine: ConnectionLine;
    connections: Connection[];
  }>;

  constructor(ui: UIStore, data: DataStore) {
    makeObservable<VisualisationStore, 'crs' | 'minZoom' | 'maxZoom'>(this, {
      pixelOrigin: observable,
      zoom: observable,
      activeElement: observable,
      width: observable,
      viewBounds: observableRef,
      maxPlaceCircleRadius: observable,
      transitionConnectionLines: observable,
      transitionConnectionOpacity: observable,
      crs: observable,
      minZoom: observable,
      maxZoom: observable,
      handleGraphTick: action,
      handleGraphEnd: action,
      updateProjection: action,
      updateWidth: action,
      updateUI: action,
      prepareConnectionTransitions: action,
      commitConnectionTransitions: action,
      endConnectionTransitions: action,
      updateConnectionTransitionOpacity: action,
      deactivateElement: action,
      ready: computed,
      zoomScale: computed,
      scale: computed,
      placeCircles: computed,
      connectionLines: computed,
      initialBounds: computed,
      elements: computed,
      visiblePlaceCircles: computed,
      visibleConnectionLines: computed,
      placeStrokeWidthScale: computed,
      placeCircleRadiusScale: computed,
      connectionStrokeWidthScale: computed,
      connectionLineDistanceDomain: computed,
      connectionLineDurationDomain: computed,
      connectionLineFrequencyDomain: computed,
      connectionLineBeelineScale: computed,
      connectionLineDurationDistanceScale: computed,
      connectionLineFrequencyDistanceScale: computed,
    });

    this.ui = ui;
    this.data = data;

    this.graph = new GraphStore(this, this.handleGraphTick, this.handleGraphEnd);
  }

  handleGraphTick = (nodes: PlaceCircleNode[]) => {
    nodes.forEach((node) => {
      node.placeCircle.graphPoint = node.clone();
    });
  };

  handleGraphEnd = (nodes: PlaceCircleNode[]) => {
    nodes.forEach((node) => {
      node.placeCircle.graphPoint = node.round();
    });
  };

  updateProjection(map: LeafletMap) {
    this.crs = map.options.crs;
    this.zoom = map.getZoom();
    this.minZoom = map.getMinZoom();
    this.maxZoom = Math.min(MAX_ZOOM, map.getMaxZoom());

    const size = map.getSize();
    const padding = SVG_RENDER_PADDING;
    const min = map.containerPointToLayerPoint(point(size.x * -padding, size.y * -padding)).round();
    const paddedSize = size.multiplyBy(1 + padding * 2).round();
    const viewBounds = bounds(min, min.add(paddedSize));

    if (
      this.viewBounds?.min == null ||
      this.viewBounds.max == null ||
      viewBounds.min == null ||
      viewBounds.max == null ||
      !this.viewBounds.min.equals(viewBounds.min) ||
      !this.viewBounds.max.equals(viewBounds.max)
    ) {
      this.viewBounds = viewBounds;
    }

    const pixelOrigin = map.getPixelOrigin();

    if (this.pixelOrigin == null || !this.pixelOrigin.equals(pixelOrigin)) {
      this.pixelOrigin = pixelOrigin;
    }

    this.graph.updateProjection();
  }

  updateWidth(width: number) {
    this.width = width;

    let maxPlaceCircleRadius = createPlaceRadiusRangeScale(width).range()[1][1];

    if (this.maxPlaceCircleRadius != null) {
      maxPlaceCircleRadius = Math.max(maxPlaceCircleRadius, this.maxPlaceCircleRadius);
    }

    this.maxPlaceCircleRadius = Math.ceil(maxPlaceCircleRadius);
  }

  updateUI({ view, timeSpan }: { timeSpan?: ReadonlyArray<number>; view?: VIEW }) {
    const timeSpanChanged = this.uiInitialized && !isEqual(this.ui.timeSpan, timeSpan);

    if (timeSpanChanged && this.ready) {
      this.graph.prepareClusterTransition();
    }

    this.ui.update({ view, timeSpan });
    this.uiInitialized = true;

    if (timeSpanChanged && this.ready) {
      this.graph.commitClusterTransition();
    }
  }

  prepareConnectionTransitions() {
    this.previousConnectionLines = this.connectionLines.map((connectionLine) => ({
      connectionLine,
      connections: [...connectionLine.connections],
    }));
  }

  commitConnectionTransitions() {
    const currentConnectionLines = this.connectionLines;
    const currentConnectionLineSet = new Set(currentConnectionLines);
    const currentConnectionLineKeys = new Set(currentConnectionLines.map((connectionLine) => connectionLine.key));
    const previousConnectionLines = this.previousConnectionLines || [];
    const transitionConnectionLines = this.transitionConnectionLines.filter(
      (connectionLine) => !currentConnectionLineKeys.has(connectionLine.key)
    );

    previousConnectionLines.forEach(({ connectionLine, connections }) => {
      if (
        currentConnectionLineSet.has(connectionLine) ||
        (connectionLine.from.transitionParent == null && connectionLine.to.transitionParent == null)
      ) {
        return;
      }

      connectionLine.connections.length = 0;
      connectionLine.connections.push(...connections);
      connectionLine.setPresentation(true);

      if (!transitionConnectionLines.includes(connectionLine)) {
        transitionConnectionLines.push(connectionLine);
      }
    });

    currentConnectionLines.forEach((connectionLine) => connectionLine.setPresentation(false));
    this.connectionLinesCache = this.connectionLinesCache.filter(
      (connectionLine) => !transitionConnectionLines.includes(connectionLine)
    );
    this.transitionConnectionLines = transitionConnectionLines;
    this.transitionConnectionOpacity = transitionConnectionLines.length > 0 ? 1 : 0;
    this.previousConnectionLines = undefined;
  }

  endConnectionTransitions() {
    this.transitionConnectionLines.forEach((connectionLine) => connectionLine.setPresentation(false));
    this.transitionConnectionLines = [];
    this.transitionConnectionOpacity = 0;
    this.previousConnectionLines = undefined;
  }

  updateConnectionTransitionOpacity(opacity: number) {
    if (this.transitionConnectionLines.length > 0) {
      this.transitionConnectionOpacity = opacity;
    }
  }

  deactivateElement() {
    this.activeElement = null;
  }

  dispose() {
    this.graph.dispose();
    this.endConnectionTransitions();
    this.toggle.cancel();
  }

  get ready() {
    return this.pixelOrigin != null && this.zoom != null && this.width != null && this.viewBounds != null;
  }

  get zoomScale() {
    if (this.maxZoom == null || this.minZoom == null) {
      return;
    }

    return scaleLinear().domain([this.minZoom, this.maxZoom]);
  }

  get scale() {
    if (this.zoomScale == null || this.zoom == null) {
      return;
    }

    return this.zoomScale(this.zoom);
  }

  get placeCircles() {
    const placeCircles: PlaceCircle[] = [];

    this.data.places.forEach((place) => {
      let placeCircle = this.placeCirclesCache.find((placeCircle) => placeCircle.place === place);

      if (placeCircle == null) {
        placeCircle = new PlaceCircle(this, place);
      }

      placeCircles.push(placeCircle);
    });

    return (this.placeCirclesCache = placeCircles);
  }

  get connectionLines() {
    const connectionLines: ConnectionLine[] = [];

    // Clear all connections to start with empty connection lines if reused.
    this.connectionLinesCache.forEach((connectionLine) => {
      connectionLine.connections.length = 0;
    });

    this.data.connections.forEach((connection) => {
      let from = this.placeCircles.find((placeCircle) => placeCircle.place === connection.from);
      let to = this.placeCircles.find((placeCircle) => placeCircle.place === connection.to);

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
      let connectionLine = connectionLines.find((connectionLine) => connectionLine.key === key);
      let newConnectionLine = false;

      if (connectionLine == null) {
        connectionLine = this.connectionLinesCache.find((connectionLine) => connectionLine.key === key);
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

  get elements() {
    return sortVisualisationElements([
      ...this.placeCircles,
      ...this.connectionLines,
      ...this.transitionConnectionLines,
    ]);
  }

  get visiblePlaceCircles() {
    return this.placeCircles.filter((placeCircle) => placeCircle.visible);
  }

  get visibleConnectionLines() {
    return this.connectionLines.filter((connectionLines) => connectionLines.visible);
  }

  get placeStrokeWidthScale() {
    const domain = extent('visibleFrequency')(this.data.visiblePlaces);

    const scale = scalePow().exponent(0.5).domain(domain);

    if (this.scale != null) {
      if (this.width == null) {
        throw new Error('Width unknown.');
      }

      const range = createPlaceStrokeWidthRangeScale(this.width)(this.scale);

      scale.range(range);
    }

    return scale;
  }

  get placeCircleRadiusScale() {
    const domain = extent('visibleDuration')(this.data.visiblePlaces);

    const scale = scalePow().exponent(0.5).domain(domain);

    if (this.scale != null) {
      if (this.width == null) {
        throw new Error('Width unknown.');
      }

      const range = createPlaceRadiusRangeScale(this.width)(this.scale);

      scale.range(range);
    }

    return scale;
  }

  get connectionStrokeWidthScale() {
    const domain = this.connectionLineFrequencyDomain;

    const scale = scalePow().exponent(0.25).domain(domain);

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

  get connectionLineDistanceDomain() {
    return extent('visibleDistance')(this.visibleConnectionLines);
  }

  get connectionLineDurationDomain() {
    return extent('visibleDuration')(this.visibleConnectionLines);
  }

  get connectionLineFrequencyDomain() {
    return extent('visibleFrequency')(this.visibleConnectionLines);
  }

  get connectionLineBeelineScale() {
    const beelineExtent = extent('beeline');

    return scaleLinear().domain(beelineExtent(this.data.connections)).range(beelineExtent(this.connectionLines));
  }

  get connectionLineDurationDistanceScale() {
    return scaleLinear().domain(this.connectionLineDurationDomain).range(this.connectionLineDistanceDomain);
  }

  get connectionLineFrequencyDistanceScale() {
    const range = this.connectionLineDistanceDomain;

    return scalePow()
      .exponent(0.5)
      .domain(reverse(this.connectionLineFrequencyDomain))
      .range([range[0], range[1] * 0.75]);
  }

  project(latLng: LatLng, zoom: number | undefined = this.zoom, pixelOrigin: Point | undefined = this.pixelOrigin) {
    if (this.crs == null) {
      throw new Error('No CRS.');
    }

    if (zoom == null || pixelOrigin == null) {
      throw new Error('Cannot calculate point without zoom or pixel origin.');
    }

    return this.crs.latLngToPoint(latLng, zoom).subtract(pixelOrigin);
  }

  unproject(point: Point, zoom: number | undefined = this.zoom, pixelOrigin: Point | undefined = this.pixelOrigin) {
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
