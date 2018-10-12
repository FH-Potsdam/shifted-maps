import {
  ForceLink,
  forceLink,
  ForceManyBody,
  forceManyBody,
  forceSimulation,
  forceX,
  ForceX,
  forceY,
  ForceY,
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from 'd3';
import { Map as LeafletMap, Point } from 'leaflet';
import { action, autorun, computed, IReactionDisposer } from 'mobx';

import ConnectionLine from './ConnectionLine';
import PlaceCircle from './PlaceCircle';
import VisualisationStore from './VisualisationStore';

type TickCallback = (nodes: PlaceCircleNode[]) => void;
type EndCallback = (nodes: PlaceCircleNode[]) => void;

class GraphStore {

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

  @action
  public update(map: LeafletMap) {
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

  public dispose() {
    this._toggleDisposer();
    this._updateDisposer();
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
}

export class PlaceCircleNode extends Point implements SimulationNodeDatum {
  public readonly placeCircle: PlaceCircle;

  public key: string;
  public index?: number;
  public vx?: number;
  public vy?: number;
  public fx?: number | null;
  public fy?: number | null;

  constructor(placeCircle: PlaceCircle) {
    super(placeCircle.mapPoint.x, placeCircle.mapPoint.y);

    this.placeCircle = placeCircle;
    this.key = String(placeCircle.key);
  }
}

export class ConnectionLineLink implements SimulationLinkDatum<PlaceCircleNode> {
  public readonly connectionLine: ConnectionLine;

  public source: PlaceCircleNode | string;
  public target: PlaceCircleNode | string;
  public index?: number;

  constructor(connectionLine: ConnectionLine) {
    this.connectionLine = connectionLine;

    this.source = String(this.connectionLine.from.key);
    this.target = String(this.connectionLine.to.key);
  }
}

export default GraphStore;
