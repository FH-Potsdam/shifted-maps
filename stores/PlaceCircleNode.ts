import { SimulationNodeDatum } from 'd3';
import { Point } from 'leaflet';
import PlaceCircle from './PlaceCircle';

class PlaceCircleNode extends Point implements SimulationNodeDatum {
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

export default PlaceCircleNode;
