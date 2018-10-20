import { Point } from 'leaflet';

import baseRound from './round';

function roundPoint(precision?: number) {
  const round = baseRound(precision);

  return ({ x, y }: Point) => new Point(round(x), round(y));
}

export default roundPoint;
