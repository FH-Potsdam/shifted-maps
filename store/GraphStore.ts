import { computed, action, reaction } from 'mobx';
import {
  forceSimulation,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
  forceLink,
  forceX,
  forceY,
} from 'd3';
import { Map as LeafletMap, Point } from 'leaflet';

import VisualisationStore from './VisualisationStore';
import PlaceCircle from './PlaceCircle';
import ConnectionLine from './ConnectionLine';
import { VIEW } from './UIStore';

type TickCallback = (nodes: PlaceCircleNode[]) => void;

class GraphStore {
  readonly vis: VisualisationStore;
  readonly onTick: TickCallback;

  private _simulation?: Simulation<PlaceCircleNode, ConnectionLineLink>;
  private _nodes: PlaceCircleNode[] = [];
  private _links: ConnectionLineLink[] = [];
  private _zoom?: number;

  constructor(vis: VisualisationStore, onTick: TickCallback) {
    this.vis = vis;
    this.onTick = onTick;

    reaction(
      () => ({ view: this.vis.ui.view, links: this.links, nodes: this.nodes }),
      ({ view, links, nodes }) => {
        if (view == null) {
          return;
        }

        if (this._simulation != null) {
          this._simulation.stop();
        }

        const linkForce = forceLink<PlaceCircleNode, ConnectionLineLink>(links)
          .id(node => node.key)
          .strength(1)
          .distance(link => link.connectionLine.viewLength);

        const xForce = forceX<PlaceCircleNode>()
          .x(node => node.placeCircle.mapPoint.x)
          .strength(0.05);
        const yForce = forceY<PlaceCircleNode>()
          .y(node => node.placeCircle.mapPoint.y)
          .strength(0.05);

        this._simulation = forceSimulation<PlaceCircleNode, ConnectionLineLink>(nodes)
          .force('link', linkForce)
          .force('x', xForce)
          .force('y', yForce)
          .on('tick', this.handleTick);
      }
    );
  }

  @action
  update(map: LeafletMap) {
    /*const prevZoom = this._zoom;
    const nextZoom = map.getZoom();

    if (prevZoom != null && prevZoom !== nextZoom) {
      this.nodes.forEach(node => {
        const prevLatLng = map.unproject(node, prevZoom);
        const { x, y } = map.latLngToLayerPoint(prevLatLng);

        node.x = x;
        node.y = y;
      });
    }

    this._zoom = nextZoom;*/
  }

  @action
  handleTick = () => {
    this.onTick(this.nodes);
  };

  @computed
  get nodes() {
    const nodes: PlaceCircleNode[] = [];

    this.vis.visiblePlaceCircles.forEach(placeCircle => {
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

    this.vis.visibleConnectionLines.forEach(connectionLine => {
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
