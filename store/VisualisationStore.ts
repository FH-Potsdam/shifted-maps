import { observable, computed, action, autorun } from 'mobx';
import { Map as LeafletMap, latLngBounds, LatLngBounds } from 'leaflet';
import { scaleLinear, ScaleLinear, scalePow, ScalePower } from 'd3';
import orderBy from 'lodash/fp/orderBy';

import DataStore from './DataStore';
import PlaceCircle from './PlaceCircle';

export const sortByHoverRadius = orderBy<PlaceCircle>(['hover', 'radius'], ['asc', 'asc']);

class VisualisationStore {
  readonly dataStore: DataStore;
  readonly zoomScale: ScaleLinear<number, number>;
  readonly placeCircles: PlaceCircle[];
  readonly initialBounds: LatLngBounds;

  private readonly _placeStrokeWidthScale: ScalePower<number, number>;
  private readonly _placeRadiusScale: ScalePower<number, number>;
  private readonly _connectionStrokeWidthScale: ScalePower<number, number>;
  private readonly _placeStrokeWidthRangeScale: ScalePower<[number, number], [number, number]>;
  private readonly _placeRadiusRangeScale: ScalePower<[number, number], [number, number]>;
  private readonly _connectionStrokeWidthRangeScale: ScalePower<[number, number], [number, number]>;

  @observable
  scale?: number;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;

    this.zoomScale = scaleLinear();

    this._placeStrokeWidthScale = scalePow().exponent(0.5);
    this._placeRadiusScale = scalePow().exponent(0.5);
    this._connectionStrokeWidthScale = scalePow().exponent(0.25);

    this._placeStrokeWidthRangeScale = scalePow<[number, number]>()
      .exponent(2)
      .range([[1, 5], [4, 20]]);
    this._placeRadiusRangeScale = scalePow<[number, number]>()
      .exponent(2)
      .range([[10, 50], [50, 300]]);
    this._connectionStrokeWidthRangeScale = scalePow<[number, number]>()
      .exponent(2)
      .range([[0.5, 5], [1, 10]]);

    this.placeCircles = this.dataStore.places.map(place => new PlaceCircle(this, place));
    this.initialBounds = this.dataStore.places
      .reduce((bounds, place) => {
        bounds.extend(place.latLng);

        return bounds;
      }, latLngBounds([]))
      .pad(0.1);

    autorun(() => {});
  }

  @action
  update(map: LeafletMap) {
    let maxZoom = map.getMaxZoom();

    if (maxZoom === Infinity) {
      maxZoom = 18;
    }

    this.zoomScale.domain([map.getMinZoom(), maxZoom]);
    this.scale = this.zoomScale(map.getZoom());

    this.placeCircles.forEach(placeCircle => {
      placeCircle.update(map);
    });
  }

  @computed
  get sortedPlaceCircles() {
    return sortByHoverRadius(this.placeCircles);
  }

  @computed
  get placeStrokeWidthScale() {
    const domain = this.dataStore.visiblePlaces.reduce(
      ([min, max], { frequency }) => {
        return [Math.min(min, frequency), Math.max(max, frequency)];
      },
      [Infinity, -Infinity]
    );

    this._placeStrokeWidthScale.domain(domain);

    if (this.scale != null) {
      const range = this._placeStrokeWidthRangeScale(this.scale);

      this._placeStrokeWidthScale.range(range);
    }

    return this._placeStrokeWidthScale.copy();
  }

  @computed
  get placeRadiusScale() {
    const domain = this.dataStore.visiblePlaces.reduce(
      ([min, max], { duration }) => {
        return [Math.min(min, duration), Math.max(max, duration)];
      },
      [Infinity, -Infinity]
    );

    this._placeRadiusScale.domain(domain);

    if (this.scale != null) {
      const range = this._placeRadiusRangeScale(this.scale);

      this._placeRadiusScale.range(range);
    }

    return this._placeRadiusScale.copy();
  }

  @computed
  get connectionStrokeWidthScale() {
    const domain = this.dataStore.visibleConnections.reduce(
      ([min, max], { frequency }) => {
        return [Math.min(min, frequency), Math.max(max, frequency)];
      },
      [Infinity, -Infinity]
    );

    this._connectionStrokeWidthScale.domain(domain);

    if (this.scale != null) {
      const range = this._connectionStrokeWidthRangeScale(this.scale);

      this._connectionStrokeWidthScale.range(range);
    }

    return this._connectionStrokeWidthScale.copy();
  }
}

export default VisualisationStore;
