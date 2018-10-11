import { Component } from 'react';
import { configure, action } from 'mobx';
import { observer } from 'mobx-react';
import { LeafletEvent, Map as LeafletMap, LatLng } from 'leaflet';

import { DiaryData } from '../../stores/Diary';
import DataStore from '../../stores/DataStore';
import Map from './Map';
import SVGLayer from './SVGLayer';
import PlaceCircleList from './PlaceCircleList';
import VisualisationStore from '../../stores/VisualisationStore';
import ConnectionLineList from './ConnectionLineList';
import CustomControl from './CustomControl';
import FilterToolbar from './FilterToolbar';
import UIStore, { VIEW } from '../../stores/UIStore';

configure({
  enforceActions: 'observed',
});

type Props = {
  data: DiaryData;
  view?: VIEW;
  timeSpan?: [number, number];
  onFilterBarViewChange: (view?: VIEW) => void;
};

@observer
class Visualisation extends Component<Props> {
  private _dataStore: DataStore;
  private _visStore: VisualisationStore;
  private _uiStore: UIStore;
  private _map?: LeafletMap;
  private _zoom?: number;
  private _center?: LatLng;

  constructor(props: Props) {
    super(props);

    const { view, data, timeSpan } = props;

    this._uiStore = new UIStore();
    this._dataStore = new DataStore(this._uiStore, data);
    this._visStore = new VisualisationStore(this._uiStore, this._dataStore);

    this._uiStore.update({ view, timeSpan });
  }

  componentDidUpdate() {
    const { view, timeSpan } = this.props;

    this._uiStore.update({ view, timeSpan });

    if (this._map != null) {
      this._visStore.update(this._map);
    }
  }

  componentWillUnmount() {
    this._visStore.dispose();
  }

  @action
  handleMapViewDidChange = (event: LeafletEvent) => {
    this._map = event.target;

    if (this._map == null) {
      return;
    }

    const nextZoom = this._map.getZoom();
    const nextCenter = this._map.getCenter();

    if (this._zoom !== nextZoom || this._center == null || !this._center.equals(nextCenter)) {
      this._visStore.update(this._map);
    }

    this._zoom = this._map.getZoom();
    this._center = this._map.getCenter();
  };

  handleFilterBarViewChange = (view?: VIEW) => {
    this.props.onFilterBarViewChange(view);
  };

  render() {
    const { sortedPlaceCircles, sortedConnectionLines, initialBounds } = this._visStore;
    const { view } = this._uiStore;

    return (
      <Map
        bounds={initialBounds}
        showTiles={view == null}
        // @ts-ignore outdated types
        whenReady={this.handleMapViewDidChange}
        onMoveEnd={this.handleMapViewDidChange}
        onZoomEnd={this.handleMapViewDidChange}
        onResize={this.handleMapViewDidChange}
      >
        <SVGLayer>
          <defs>
            <clipPath id="clip-path-circle" clipPathUnits="objectBoundingBox">
              <circle r="0.5" cx="0.5" cy="0.5" />
            </clipPath>
          </defs>
          <ConnectionLineList connectionLines={sortedConnectionLines} />
          <PlaceCircleList placeCircles={sortedPlaceCircles} />
          <CustomControl position="topleft">
            <FilterToolbar
              ui={this._uiStore}
              data={this._dataStore}
              onViewChange={this.handleFilterBarViewChange}
            />
          </CustomControl>
        </SVGLayer>
      </Map>
    );
  }
}

export default Visualisation;
