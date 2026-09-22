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
import { autorun, computed, IReactionDisposer, makeObservable } from 'mobx';

import createClusterForce, {
  advanceSpring,
  beginSplitTransition,
  ClusterTransitionAccessors,
  obsoleteConnectionOpacity,
} from './ClusterMotion';
import ConnectionLineLink from './ConnectionLineLink';
import PlaceCircle from './PlaceCircle';
import PlaceCircleNode from './PlaceCircleNode';
import { VIEW } from './UIStore';
import VisualisationStore from './VisualisationStore';

type SimulationEventCallback = (nodes: PlaceCircleNode[]) => void;

const clusterMotionAccessors: ClusterTransitionAccessors<PlaceCircleNode> = {
  key: (node) => node.placeCircle,
  parentKey: (node) => node.placeCircle.transitionParent,
  visible: (node) => node.placeCircle.visible,
  radius: (node) => node.placeCircle.radius,
  target: (node) => node.placeCircle.mapPoint,
  snapSize: (node) => {
    node.placeCircle.updatePresentationSize(node.placeCircle.radius, node.placeCircle.strokeWidth);
  },
};

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

  private zoom?: number;
  private pixelOrigin?: Point;
  private previousRoots?: Map<PlaceCircle, PlaceCircle | undefined>;

  private prevView?: VIEW;
  private prevTimeSpan?: readonly number[];
  private initialized = false;

  constructor(vis: VisualisationStore, onTick: SimulationEventCallback, onEnd: SimulationEventCallback) {
    makeObservable(this, {
      nodes: computed,
      links: computed,
    });

    this.vis = vis;
    this.onTick = onTick;
    this.onEnd = onEnd;

    this.linkForce = forceLink<PlaceCircleNode, ConnectionLineLink>()
      .id((node) => node.key)
      .distance((link) => link.connectionLine.viewLength);

    this.xForce = forceX<PlaceCircleNode>().x((node) => node.placeCircle.mapPoint.x);
    this.yForce = forceY<PlaceCircleNode>().y((node) => node.placeCircle.mapPoint.y);

    // this.manyBodyForce = forceManyBody<PlaceCircleNode>();
    // this.collideForce = forceCollide<PlaceCircleNode>().strength(0.1);

    this.simulation = forceSimulation<PlaceCircleNode, ConnectionLineLink>()
      .force('link', this.linkForce)
      .force('x', this.xForce)
      .force('y', this.yForce)
      .force(
        'cluster',
        createClusterForce<PlaceCircleNode, ConnectionLineLink>(clusterMotionAccessors)
      )
      // .force('many-body', this.manyBodyForce)
      // .force('collide', this.collideForce)
      .on('tick', this.handleSimulationTick)
      .on('end', this.handleSimulationEnd)
      .velocityDecay(0.9)
      .stop();

    this.restartDisposer = autorun(this.restartSimulation);
    this.updateDisposer = autorun(this.updateSimulation);
  }

  prepareClusterTransition() {
    this.vis.prepareConnectionTransitions();
    this.previousRoots = new Map(
      this.vis.placeCircles.map((placeCircle) => [
        placeCircle,
        placeCircle.place.visible ? placeCircle.parent || placeCircle : undefined,
      ])
    );
    this.simulation.stop();
  }

  stop() {
    this.simulation.stop();
  }

  commitClusterTransition() {
    if (this.previousRoots == null) {
      return;
    }

    const nodes = this.nodes;
    const nodesByPlaceCircle = new Map(nodes.map((node) => [node.placeCircle, node]));

    nodes.forEach((node) => {
      const { placeCircle } = node;
      const previousRoot = this.previousRoots?.get(placeCircle);
      const nextRoot = placeCircle.place.visible ? placeCircle.parent || placeCircle : undefined;

      if (previousRoot == null || nextRoot == null || previousRoot === nextRoot) {
        return;
      }

      if (!placeCircle.intersectsViewBounds && !previousRoot.intersectsViewBounds && !nextRoot.intersectsViewBounds) {
        placeCircle.endClusterTransition();
        return;
      }

      if (placeCircle.transitionParent != null && nextRoot !== placeCircle) {
        placeCircle.beginClusterTransition(nextRoot);
        node.vx = (node.vx || 0) * 0.35;
        node.vy = (node.vy || 0) * 0.35;
        return;
      }

      if (previousRoot === placeCircle) {
        placeCircle.beginClusterTransition(nextRoot);
        node.vx = (node.vx || 0) * 0.35;
        node.vy = (node.vy || 0) * 0.35;
        return;
      }

      if (nextRoot !== placeCircle) {
        return;
      }

      placeCircle.beginClusterTransition(previousRoot);

      const previousRootNode = nodesByPlaceCircle.get(previousRoot);

      if (previousRootNode?.x == null || previousRootNode.y == null) {
        return;
      }

      beginSplitTransition(node, previousRootNode, clusterMotionAccessors);
    });

    this.previousRoots = undefined;
    this.vis.commitConnectionTransitions();
    this.simulation.alpha(1).restart();
    this.onTick(nodes);
  }

  private handleSimulationEnd = () => {
    this.nodes.forEach((node) => {
      const { placeCircle } = node;
      placeCircle.updatePresentationSize(placeCircle.radius, placeCircle.strokeWidth);
      node.radiusVelocity = 0;
      node.strokeWidthVelocity = 0;
    });
    this.nodes.forEach((node) => node.placeCircle.endClusterTransition());
    this.vis.endConnectionTransitions();
    this.onEnd(this.nodes);
  };

  private handleSimulationTick = () => {
    this.vis.updateConnectionTransitionOpacity(
      obsoleteConnectionOpacity(this.simulation.alpha(), this.simulation.alphaMin())
    );

    this.nodes.forEach((node) => {
      const { placeCircle } = node;

      if (!placeCircle.intersectsViewBounds && placeCircle.transitionParent == null) {
        placeCircle.updatePresentationSize(placeCircle.radius, placeCircle.strokeWidth);
        node.radiusVelocity = 0;
        node.strokeWidthVelocity = 0;
        return;
      }

      const currentRadius = placeCircle.presentationRadius;
      const currentStrokeWidth = placeCircle.presentationStrokeWidth;
      const radius = advanceSpring(
        { value: currentRadius, velocity: node.radiusVelocity },
        placeCircle.radius
      );
      const strokeWidth = advanceSpring(
        { value: currentStrokeWidth, velocity: node.strokeWidthVelocity },
        placeCircle.strokeWidth
      );

      node.radiusVelocity = radius.velocity;
      node.strokeWidthVelocity = strokeWidth.velocity;

      placeCircle.updatePresentationSize(radius.value, strokeWidth.value);
    });

    this.onTick(this.nodes);
  };

  dispose() {
    this.stop();

    this.restartDisposer();
    this.updateDisposer();
  }

  private restartSimulation = () => {
    const { ready, ui } = this.vis;

    if (!ready || (this.initialized && ui.view === this.prevView && isEqual(ui.timeSpan, this.prevTimeSpan))) {
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

    this.linkForce.links(this.links).strength((link) => (viewActive && link.connectionLine.visible ? 0.7 : 0));

    this.xForce.strength(viewActive ? 0.1 : 1);
    this.yForce.strength(viewActive ? 0.1 : 1);
  };

  updateProjection() {
    const { zoom: nextZoom, pixelOrigin: nextPixelOrigin } = this.vis;

    if (nextZoom == null || nextPixelOrigin == null) {
      return;
    }

    const prevZoom = this.zoom;
    const prevPixelOrigin = this.pixelOrigin;

    if (prevZoom != null && prevPixelOrigin != null) {
      const zoomScale = Math.pow(2, nextZoom - prevZoom);

      this.nodes.forEach((node) => {
        // latLngToLayerPoint for custom zoom
        const prevLatLng = this.vis.unproject(node, prevZoom, prevPixelOrigin);
        const nextPoint = this.vis.project(prevLatLng, nextZoom, nextPixelOrigin);

        node.x = nextPoint.x;
        node.y = nextPoint.y;

        if (this.previousRoots?.get(node.placeCircle) === node.placeCircle) {
          node.placeCircle.updatePresentationSize(
            node.placeCircle.presentationRadius * zoomScale,
            node.placeCircle.presentationStrokeWidth * zoomScale
          );
          node.radiusVelocity *= zoomScale;
          node.strokeWidthVelocity *= zoomScale;
        }
      });

      this.commitClusterTransition();

      // Run tick to update place circles as soon as possible.
      this.onTick(this.nodes);
      this.restartSimulation();
    }

    this.zoom = nextZoom;
    this.pixelOrigin = nextPixelOrigin;
  }

  get nodes() {
    const nodes: PlaceCircleNode[] = [];

    this.vis.placeCircles.forEach((placeCircle) => {
      let node = this.cachedNodes.find((node) => node.placeCircle === placeCircle);

      if (node == null) {
        node = new PlaceCircleNode(placeCircle);
      }

      nodes.push(node);
    });

    return (this.cachedNodes = nodes);
  }

  get links() {
    const links: ConnectionLineLink[] = [];

    this.vis.connectionLines.forEach((connectionLine) => {
      let link = this.cachedLinks.find((link) => link.connectionLine === connectionLine);

      if (link == null) {
        link = new ConnectionLineLink(connectionLine);
      }

      links.push(link);
    });

    return (this.cachedLinks = links);
  }
}

export default GraphStore;
