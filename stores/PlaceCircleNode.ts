import { SimulationNodeDatum } from 'd3';
import { Point } from 'leaflet';

import PlaceCircle from './PlaceCircle';

class PlaceCircleNode extends Point implements SimulationNodeDatum {
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

export default PlaceCircleNode;
