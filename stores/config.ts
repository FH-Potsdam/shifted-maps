import { scalePow } from 'd3';
import { CRS as LeafletCRS } from 'leaflet';

export const MAX_ZOOM = 18;
export const CRS = LeafletCRS.EPSG3857;

export const PLACE_STROKE_WIDTH_RANGE_SCALE = scalePow<[number, number]>()
  .exponent(2)
  .range([[1, 5], [4, 20]]);

export const PLACE_RADIUS_RANGE_SCALE = scalePow<[number, number]>()
  .exponent(2)
  .range([[10, 50], [50, 300]]);

export const CONNECTION_STROKE_WIDTH_RANGE_SCALE = scalePow<[number, number]>()
  .exponent(2)
  .range([[0.5, 5], [1, 10]]);
