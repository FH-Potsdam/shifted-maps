import { computed, autorun, action, IReactionDisposer } from 'mobx';
import {
  forceSimulation,
  forceLink,
  forceX,
  forceY,
  forceManyBody,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
  ForceLink,
  ForceX,
  ForceY,
  ForceManyBody,
} from 'd3';
import { Map as LeafletMap, Point } from 'leaflet';

import VisualisationStore from './VisualisationStore';
import PlaceCircle from './PlaceCircle';
import ConnectionLine from './ConnectionLine';

type TickCallback = (nodes: PlaceCircleNode[]) => void;
type EndCallback = (nodes: PlaceCircleNode[]) => void;

class GraphStore {
  private readonly _vis: VisualisationStore;
  private readonly _onTick: TickCallback;
  private readonly _onEnd: EndCallback;

  private _nodes: PlaceCircleNode[] = [];
  private _links: ConnectionLineLink[] = [];

  private _simulation: Simulation<PlaceCircleNode, ConnectionLineLink>;
  private _linkForce: ForceLink<PlaceCircleNode, ConnectionLineLink>;
  private _xForce: ForceX<PlaceCircleNode>;
  private _yForce: ForceY<PlaceCircleNode>;
  private _manyBodyForce: ForceManyBody<PlaceCircleNode>;

  private _toggleDisposer: IReactionDisposer;
  private _updateDisposer: IReactionDisposer;

  private _zoom?: number;
  private _pixelOrigin?: Point;

  constructor(vis: VisualisationStore, onTick: TickCallback, onEnd: EndCallback) {
    this._vis = vis;
    this._onTick = onTick;
    this._onEnd = onEnd;

    this._linkForce = forceLink<PlaceCircleNode, ConnectionLineLink>().id(node => node.key);

    this._xForce = forceX<PlaceCircleNode>().strength(0.3);
    this._yForce = forceY<PlaceCircleNode>().strength(0.3);

    this._manyBodyForce = forceManyBody<PlaceCircleNode>();

    this._simulation = forceSimulation<PlaceCircleNode, ConnectionLineLink>()
      .force('link', this._linkForce)
      .force('x', this._xForce)
      .force('y', this._yForce)
      .force('many-body', this._manyBodyForce)
      .on('tick', () => this._onTick(this.nodes))
      .on('end', () => this._onEnd(this.nodes))
      .velocityDecay(0.9)
      .stop();

    this._toggleDisposer = autorun(this._toggleSimulation);
    this._updateDisposer = autorun(this._updateSimulation);
  }

  private _toggleSimulation = () => {
    const { view } = this._vis.ui;

    if (view == null) {
      this._simulation.stop();
    } else {
      this._simulation.alpha(1);
      this._simulation.restart();
    }
  };

  private _updateSimulation = () => {
    const { view } = this._vis.ui;

    if (view == null) {
      return;
    }

    this._simulation.nodes(this.nodes);
    this._linkForce.links(this.links).distance(link => link.connectionLine.viewLength);
    this._xForce.x(node => node.placeCircle.mapPoint.x);
    this._yForce.y(node => node.placeCircle.mapPoint.y);
  };

  @action
  update(map: LeafletMap) {
    const prevZoom = this._zoom;
    const nextZoom = map.getZoom();
    const prevPixelOrigin = this._pixelOrigin;
    const nextPixelOrigin = map.getPixelOrigin();

    if (prevZoom != null && prevPixelOrigin != null && nextZoom !== prevZoom) {
      this.nodes.forEach(node => {
        // latLngToLayerPoint for custom zoom
        const prevLatLng = map.unproject(node.add(prevPixelOrigin), prevZoom);
        const nextPoint = map.latLngToLayerPoint(prevLatLng);

        node.x = nextPoint.x;
        node.y = nextPoint.y;
      });

      // Run tick to update place circles as soon as possible.
      this._onTick(this.nodes);
      this._toggleSimulation();
    }

    this._zoom = nextZoom;
    this._pixelOrigin = nextPixelOrigin;
  }

  dispose() {
    this._toggleDisposer();
    this._updateDisposer();
  }

  @computed
  get nodes() {
    const nodes: PlaceCircleNode[] = [];

    this._vis.placeCircles.forEach(placeCircle => {
      let node = this._nodes.find(node => node.placeCircle === placeCircle);

      if (node == null) {
        node = new PlaceCircleNode(placeCircle);
      }

      nodes.push(node);
    });

    return (this._nodes = nodes);
  }

  @computed
  get links() {
    const links: ConnectionLineLink[] = [];

    this._vis.connectionLines.forEach(connectionLine => {
      let link = this._links.find(link => link.connectionLine === connectionLine);

      if (link == null) {
        link = new ConnectionLineLink(connectionLine);
      }

      links.push(link);
    });

    return (this._links = links);
  }
}

export class PlaceCircleNode extends Point implements SimulationNodeDatum {
  readonly placeCircle: PlaceCircle;

  key: string;
  index?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  constructor(placeCircle: PlaceCircle) {
    super(placeCircle.mapPoint.x, placeCircle.mapPoint.y);

    this.placeCircle = placeCircle;
    this.key = String(placeCircle.key);
  }
}

export class ConnectionLineLink implements SimulationLinkDatum<PlaceCircleNode> {
  readonly connectionLine: ConnectionLine;

  source: PlaceCircleNode | string;
  target: PlaceCircleNode | string;
  index?: number;

  constructor(connectionLine: ConnectionLine) {
    this.connectionLine = connectionLine;

    this.source = String(this.connectionLine.from.key);
    this.target = String(this.connectionLine.to.key);
  }
}

export default GraphStore;
