import { SimulationLinkDatum } from 'd3';

import ConnectionLine from './ConnectionLine';
import PlaceCircleNode from './PlaceCircleNode';

class ConnectionLineLink implements SimulationLinkDatum<PlaceCircleNode> {
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

export default ConnectionLineLink;
