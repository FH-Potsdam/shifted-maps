import {
  // ForceCollide,
  // forceCollide,
  // ForceManyBody,
  // forceManyBody,
  ForceLink,
  forceLink,
  forceSimulation,
  forceX,
  ForceX,
  forceY,
  ForceY,
  Simulation,
} from 'd3-force';
import { Point } from 'leaflet';
import isEqual from 'lodash/fp/isEqual';
import { autorun, computed, IReactionDisposer } from 'mobx';

import ConnectionLineLink from './ConnectionLineLink';
import PlaceCircleNode from './PlaceCircleNode';
import { VIEW } from './UIStore';
import VisualisationStore from './VisualisationStore';

type SimulationEventCallback = (nodes: PlaceCircleNode[]) => void;

class GraphStore {
  private readonly vis: VisualisationStore;
  private readonly onTick: SimulationEventCallback;
  private readonly onEnd: SimulationEventCallback;

  private cachedNodes: PlaceCircleNode[] = [];
  private cachedLinks: ConnectionLineLink[] = [];

  private readonly simulation: Simulation<PlaceCircleNode, ConnectionLineLink>;
  private readonly linkForce: ForceLink<PlaceCircleNode, ConnectionLineLink>;
  private readonly xForce: ForceX<PlaceCircleNode>;
  private readonly yForce: ForceY<PlaceCircleNode>;
  // private readonly manyBodyForce: ForceManyBody<PlaceCircleNode>;
  // private readonly collideForce: ForceCollide<PlaceCircleNode>;

  private restartDisposer: IReactionDisposer;
  private updateDisposer: IReactionDisposer;
  private zoomDisposer: IReactionDisposer;

  private zoom?: number;
  private pixelOrigin?: Point;

  private prevView?: VIEW;
  private prevTimeSpan?: readonly number[];
  private initialized = false;

  constructor(
    vis: VisualisationStore,
    onTick: SimulationEventCallback,
    onEnd: SimulationEventCallback
  ) {
    this.vis = vis;
    this.onTick = onTick;
    this.onEnd = onEnd;

    this.linkForce = forceLink<PlaceCircleNode, ConnectionLineLink>()
      .id(node => node.key)
      .distance(link => link.connectionLine.viewLength);

    this.xForce = forceX<PlaceCircleNode>().x(node => node.placeCircle.mapPoint.x);
    this.yForce = forceY<PlaceCircleNode>().y(node => node.placeCircle.mapPoint.y);

    // this.manyBodyForce = forceManyBody<PlaceCircleNode>();
    // this.collideForce = forceCollide<PlaceCircleNode>().strength(0.1);

    this.simulation = forceSimulation<PlaceCircleNode, ConnectionLineLink>()
      .force('link', this.linkForce)
      .force('x', this.xForce)
      .force('y', this.yForce)
      // .force('many-body', this.manyBodyForce)
      // .force('collide', this.collideForce)
      .on('tick', () => this.onTick(this.nodes))
      .on('end', () => this.onEnd(this.nodes))
      .velocityDecay(0.9)
      .stop();

    this.restartDisposer = autorun(this.restartSimulation);
    this.updateDisposer = autorun(this.updateSimulation);
    this.zoomDisposer = autorun(this.zoomSimulation);
  }

  stop() {
    this.simulation.stop();
  }

  dispose() {
    this.stop();

    this.restartDisposer();
    this.updateDisposer();
    this.zoomDisposer();
  }

  private restartSimulation = () => {
    const { ready, ui } = this.vis;

    if (
      !ready ||
      (this.initialized && ui.view === this.prevView && isEqual(ui.timeSpan, this.prevTimeSpan))
    ) {
      return;
    }

    this.initialized = true;
    this.prevView = ui.view;
    this.prevTimeSpan = ui.timeSpan;

    this.simulation.alpha(1);
    this.simulation.restart();
  };

  private updateSimulation = () => {
    const { ready, ui } = this.vis;

    if (!ready) {
      return;
    }

    const viewActive = ui.view != null;

    this.simulation.nodes(this.nodes);

    this.linkForce
      .links(this.links)
      .strength(link => (viewActive && link.connectionLine.visible ? 0.7 : 0));

    this.xForce.strength(viewActive ? 0.1 : 1);
    this.yForce.strength(viewActive ? 0.1 : 1);

    // this.manyBodyForce.strength(node => (viewActive && node.placeCircle.visible ? -30 : 0));
    /*this.collideForce.radius(
      node =>
        viewActive && node.placeCircle.visible
          ? node.placeCircle.radius + node.placeCircle.strokeWidth + 10
          : 0
    );*/
  };

  private zoomSimulation = () => {
    const { zoom: nextZoom, pixelOrigin: nextPixelOrigin } = this.vis;

    if (nextZoom == null || nextPixelOrigin == null) {
      return;
    }

    const prevZoom = this.zoom;
    const prevPixelOrigin = this.pixelOrigin;

    if (prevZoom != null && prevPixelOrigin != null && nextZoom !== prevZoom) {
      this.nodes.forEach(node => {
        // latLngToLayerPoint for custom zoom
        const prevLatLng = this.vis.unproject(node, prevZoom, prevPixelOrigin);
        const nextPoint = this.vis.project(prevLatLng, nextZoom, nextPixelOrigin);

        node.x = nextPoint.x;
        node.y = nextPoint.y;
      });

      // Run tick to update place circles as soon as possible.
      this.onTick(this.nodes);
      this.restartSimulation();
    }

    this.zoom = nextZoom;
    this.pixelOrigin = nextPixelOrigin;
  };

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
}

export default GraphStore;
