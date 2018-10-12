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
} from 'd3';
import { Map as LeafletMap, Point } from 'leaflet';
import { action, autorun, computed, IReactionDisposer } from 'mobx';

import ConnectionLineLink from './ConnectionLineLink';
import PlaceCircleNode from './PlaceCircleNode';
import VisualisationStore from './VisualisationStore';

type TickCallback = (nodes: PlaceCircleNode[]) => void;
type EndCallback = (nodes: PlaceCircleNode[]) => void;

class GraphStore {
  private readonly vis: VisualisationStore;
  private readonly onTick: TickCallback;
  private readonly onEnd: EndCallback;

  private cachedNodes: PlaceCircleNode[] = [];
  private cachedLinks: ConnectionLineLink[] = [];

  private simulation: Simulation<PlaceCircleNode, ConnectionLineLink>;
  private linkForce: ForceLink<PlaceCircleNode, ConnectionLineLink>;
  private xForce: ForceX<PlaceCircleNode>;
  private yForce: ForceY<PlaceCircleNode>;
  private manyBodyForce: ForceManyBody<PlaceCircleNode>;

  private toggleDisposer: IReactionDisposer;
  private updateDisposer: IReactionDisposer;

  private zoom?: number;
  private pixelOrigin?: Point;

  @computed
  get nodes() {
    const nodes: PlaceCircleNode[] = [];

    this.vis.placeCircles.forEach(placeCircle => {
      let node = this.cachedNodes.find(node => node.placeCircle === placeCircle);

      if (node == null) {
        node = new PlaceCircleNode(placeCircle);
      }

      nodes.push(node);
    });

    return (this.cachedNodes = nodes);
  }

  @computed
  get links() {
    const links: ConnectionLineLink[] = [];

    this.vis.connectionLines.forEach(connectionLine => {
      let link = this.cachedLinks.find(link => link.connectionLine === connectionLine);

      if (link == null) {
        link = new ConnectionLineLink(connectionLine);
      }

      links.push(link);
    });

    return (this.cachedLinks = links);
  }

  constructor(vis: VisualisationStore, onTick: TickCallback, onEnd: EndCallback) {
    this.vis = vis;
    this.onTick = onTick;
    this.onEnd = onEnd;

    this.linkForce = forceLink<PlaceCircleNode, ConnectionLineLink>().id(node => node.key);

    this.xForce = forceX<PlaceCircleNode>().strength(0.3);
    this.yForce = forceY<PlaceCircleNode>().strength(0.3);

    this.manyBodyForce = forceManyBody<PlaceCircleNode>();

    this.simulation = forceSimulation<PlaceCircleNode, ConnectionLineLink>()
      .force('link', this.linkForce)
      .force('x', this.xForce)
      .force('y', this.yForce)
      .force('many-body', this.manyBodyForce)
      .on('tick', () => this.onTick(this.nodes))
      .on('end', () => this.onEnd(this.nodes))
      .velocityDecay(0.9)
      .stop();

    this.toggleDisposer = autorun(this.toggleSimulation);
    this.updateDisposer = autorun(this.updateSimulation);
  }

  @action
  update(map: LeafletMap) {
    const prevZoom = this.zoom;
    const nextZoom = map.getZoom();
    const prevPixelOrigin = this.pixelOrigin;
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
      this.onTick(this.nodes);
      this.toggleSimulation();
    }

    this.zoom = nextZoom;
    this.pixelOrigin = nextPixelOrigin;
  }

  dispose() {
    this.toggleDisposer();
    this.updateDisposer();
  }

  private toggleSimulation = () => {
    const { view } = this.vis.ui;

    if (view == null) {
      this.simulation.stop();
    } else {
      this.simulation.alpha(1);
      this.simulation.restart();
    }
  };

  private updateSimulation = () => {
    const { view } = this.vis.ui;

    if (view == null) {
      return;
    }

    this.simulation.nodes(this.nodes);
    this.linkForce.links(this.links).distance(link => link.connectionLine.viewLength);
    this.xForce.x(node => node.placeCircle.mapPoint.x);
    this.yForce.y(node => node.placeCircle.mapPoint.y);
  };
}

export default GraphStore;
