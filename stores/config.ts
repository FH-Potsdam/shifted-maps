import { scaleLinear, scalePow } from 'd3';
import { CRS as LeafletCRS } from 'leaflet';

export const MAX_ZOOM = 18;
export const CRS = LeafletCRS.EPSG3857;

export const SCREEN_WIDTH_DOMAIN = [300, 1200];

/* ------ */

const PLACE_RADIUS_RANGE_MIN_SCALE = scaleLinear<[number, number]>()
  .domain(SCREEN_WIDTH_DOMAIN)
  .clamp(true)
  .range([/* min width */ [10, 30], /* max width */ [10, 50]]);

const PLACE_RADIUS_RANGE_MAX_SCALE = scaleLinear<[number, number]>()
  .domain(SCREEN_WIDTH_DOMAIN)
  .clamp(true)
  .range([/* min width */ [20, 100], /* max width */ [50, 300]]);

export function createPlaceRadiusRangeScale(width: number) {
  const rangeMin = PLACE_RADIUS_RANGE_MIN_SCALE(width);
  const rangeMax = PLACE_RADIUS_RANGE_MAX_SCALE(width);

  return scalePow<[number, number]>()
    .exponent(2)
    .range([[rangeMin[0], rangeMax[0]], [rangeMin[1], rangeMax[1]]]);
}

/* ------ */

const PLACE_STROKE_WIDTH_RANGE_MIN_SCALE = scaleLinear<[number, number]>()
  .domain(SCREEN_WIDTH_DOMAIN)
  .clamp(true)
  .range([/* min width */ [1, 2], /* max width */ [1, 2]]);

const PLACE_STROKE_WIDTH_RANGE_MAX_SCALE = scaleLinear<[number, number]>()
  .domain(SCREEN_WIDTH_DOMAIN)
  .clamp(true)
  .range([/* min width */ [1, 3], /* max width */ [5, 15]]);

export function createPlaceStrokeWidthRangeScale(width: number) {
  const rangeMin = PLACE_STROKE_WIDTH_RANGE_MIN_SCALE(width);
  const rangeMax = PLACE_STROKE_WIDTH_RANGE_MAX_SCALE(width);

  return scalePow<[number, number]>()
    .exponent(2)
    .range([[rangeMin[0], rangeMax[0]], [rangeMin[1], rangeMax[1]]]);
}

/* ------ */

const CONNECTION_STROKE_WIDTH_RANGE_MAX_SCALE = scaleLinear<[number, number]>()
  .domain(SCREEN_WIDTH_DOMAIN)
  .clamp(true)
  .range([/* min width */ [1, 5], /* max width */ [5, 10]]);

export function createConnectionStrokeWidthRangeScale(width: number) {
  const rangeMax = CONNECTION_STROKE_WIDTH_RANGE_MAX_SCALE(width);

  return scalePow<[number, number]>()
    .exponent(2)
    .range([[0.5, rangeMax[0]], [1, rangeMax[1]]]);
}

/* ------ */

export const PLACE_DOT_RADIUS_SCALE = scaleLinear<number>()
  .domain(SCREEN_WIDTH_DOMAIN)
  .clamp(true)
  .range([3, 4]);
