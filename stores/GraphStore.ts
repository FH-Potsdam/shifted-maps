import {
  ForceLink,
  forceLink,
  // ForceManyBody,
  // forceManyBody,
  forceSimulation,
  forceX,
  ForceX,
  forceY,
  ForceY,
  Simulation,
} from 'd3';
import { Point } from 'leaflet';
import { autorun, computed, IReactionDisposer } from 'mobx';

import ConnectionLineLink from './ConnectionLineLink';
import PlaceCircleNode from './PlaceCircleNode';
import VisualisationStore from './VisualisationStore';

type SimulationEventCallback = (nodes: PlaceCircleNode[]) => void;

class GraphStore {
  private readonly vis: VisualisationStore;
  private readonly onTick: SimulationEventCallback;
  private readonly onEnd: SimulationEventCallback;

  private cachedNodes: PlaceCircleNode[] = [];
  private cachedLinks: ConnectionLineLink[] = [];

  private simulation: Simulation<PlaceCircleNode, ConnectionLineLink>;
  private linkForce: ForceLink<PlaceCircleNode, ConnectionLineLink>;
  private xForce: ForceX<PlaceCircleNode>;
  private yForce: ForceY<PlaceCircleNode>;
  // private manyBodyForce: ForceManyBody<PlaceCircleNode>;

  private toggleDisposer: IReactionDisposer;
  private updateDisposer: IReactionDisposer;
  private zoomDisposer: IReactionDisposer;

  private zoom?: number;
  private pixelOrigin?: Point;

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

    this.simulation = forceSimulation<PlaceCircleNode, ConnectionLineLink>()
      .force('link', this.linkForce)
      .force('x', this.xForce)
      .force('y', this.yForce)
      // .force('many-body', this.manyBodyForce)
      .on('tick', () => this.onTick(this.nodes))
      .on('end', () => this.onEnd(this.nodes))
      .velocityDecay(0.9)
      .stop();

    this.toggleDisposer = autorun(this.toggleSimulation);
    this.updateDisposer = autorun(this.updateSimulation);
    this.zoomDisposer = autorun(this.zoomSimulation);
  }

  stop() {
    this.simulation.stop();
  }

  dispose() {
    this.stop();

    console.log('dispose graph');

    this.toggleDisposer();
    this.updateDisposer();
    this.zoomDisposer();
  }

  private toggleSimulation = () => {
    const { ready, ui } = this.vis;

    if (!ready) {
      return;
    }

    if (ui.view != null && ui.timeSpan != null) {
      console.log('How to run callback when value changed?');
    }

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
      .strength(link => (viewActive && link.connectionLine.visible ? 0.5 : 0));

    this.xForce.strength(viewActive ? 0.2 : 1);
    this.yForce.strength(viewActive ? 0.2 : 1);

    // this.manyBodyForce.strength(viewActive ? -30 : 0);
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
      this.toggleSimulation();
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
