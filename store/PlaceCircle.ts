import { computed, observable, action } from 'mobx';
import { Map as LeafletMap, Point, point } from 'leaflet';

import Place from './Place';
import VisualisationStore from './VisualisationStore';

class PlaceCircle {
  vis: VisualisationStore;
  place: Place;

  @observable
  hover: boolean = false;

  @observable.struct
  layerPoint: Point = point(0, 0);

  constructor(vis: VisualisationStore, place: Place) {
    this.vis = vis;
    this.place = place;
  }

  @action
  update(map: LeafletMap) {
    this.layerPoint = map.latLngToLayerPoint(this.place.latLng);
  }

  @computed
  get key() {
    return this.place.id;
  }

  @computed
  get radius() {
    return this.vis.placeRadiusScale(this.place.visibleDuration);
  }

  @computed
  get strokeWidth() {
    return this.vis.placeStrokeWidthScale(this.place.visibleFrequency);
  }
}

export default PlaceCircle;
