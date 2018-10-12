import { LatLng, LeafletEvent, Map as LeafletMap } from 'leaflet';
import { action, configure } from 'mobx';
import { observer } from 'mobx-react';
import { Component } from 'react';

import DataStore from '../../stores/DataStore';
import { DiaryData } from '../../stores/Diary';
import UIStore, { VIEW } from '../../stores/UIStore';
import VisualisationStore from '../../stores/VisualisationStore';
import ConnectionLineList from './ConnectionLineList';
import CustomControl from './CustomControl';
import FilterToolbar from './FilterToolbar';
import Map from './Map';
import PlaceCircleList from './PlaceCircleList';
import SVGLayer from './SVGLayer';

configure({
  enforceActions: 'observed',
});

interface IProps {
  data: DiaryData;
  view?: VIEW;
  timeSpan?: [number, number];
  onFilterBarViewChange: (view?: VIEW) => void;
}

@observer
class Visualisation extends Component<IProps> {
  private dataStore: DataStore;
  private visStore: VisualisationStore;
  private uiStore: UIStore;
  private map?: LeafletMap;
  private zoom?: number;
  private center?: LatLng;

  constructor(props: IProps) {
    super(props);

    const { view, data, timeSpan } = props;

    this.uiStore = new UIStore();
    this.dataStore = new DataStore(this.uiStore, data);
    this.visStore = new VisualisationStore(this.uiStore, this.dataStore);

    this.uiStore.update({ view, timeSpan });
  }

  @action
  public componentDidUpdate() {
    const { view, timeSpan } = this.props;

    this.uiStore.update({ view, timeSpan });

    if (this.map != null) {
      this.visStore.update(this.map);
    }
  }

  public componentWillUnmount() {
    this.visStore.dispose();
  }

  @action
  public handleMapViewDidChange = (event: LeafletEvent) => {
    this.map = event.target;

    if (this.map == null) {
      return;
    }

    const nextZoom = this.map.getZoom();
    const nextCenter = this.map.getCenter();

    if (this.zoom !== nextZoom || this.center == null || !this.center.equals(nextCenter)) {
      this.visStore.update(this.map);
    }

    this.zoom = this.map.getZoom();
    this.center = this.map.getCenter();
  };

  public render() {
    const { sortedPlaceCircles, sortedConnectionLines, initialBounds } = this.visStore;
    const { view } = this.uiStore;
    const { onFilterBarViewChange } = this.props;

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
              ui={this.uiStore}
              data={this.dataStore}
              onViewChange={onFilterBarViewChange}
            />
          </CustomControl>
        </SVGLayer>
      </Map>
    );
  }
}

export default Visualisation;
