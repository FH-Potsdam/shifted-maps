import { SimulationLinkDatum } from 'd3';

import ConnectionLine from './ConnectionLine';
import PlaceCircleNode from './PlaceCircleNode';

class ConnectionLineLink implements SimulationLinkDatum<PlaceCircleNode> {
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

export default ConnectionLineLink;
