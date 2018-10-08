import { Component } from 'react';
import { configure, action } from 'mobx';
import { observer } from 'mobx-react';
import { LeafletEvent } from 'leaflet';

import { DiaryData } from '../../store/Diary';
import DataStore from '../../store/DataStore';
import Map from './Map';
import SVGLayer from './SVGLayer';
import PlaceCircleList from './PlaceCircleList';
import VisualisationStore from '../../store/VisualisationStore';
import ConnectionLineList from './ConnectionLineList';
import CustomControl from './CustomControl';
import FilterToolbar from './FilterToolbar';
import UIStore, { VIEW } from '../../store/UIStore';

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
  dataStore: DataStore;
  visStore: VisualisationStore;
  uiStore: UIStore;

  constructor(props: Props) {
    super(props);

    const { view, data, timeSpan } = props;

    this.uiStore = new UIStore();
    this.dataStore = new DataStore(this.uiStore, data);
    this.visStore = new VisualisationStore(this.uiStore, this.dataStore);

    this.uiStore.update({ view, timeSpan });
  }

  componentDidUpdate() {
    const { view, timeSpan } = this.props;

    this.uiStore.update({ view, timeSpan });
  }

  @action
  handleMapViewChange = (event: LeafletEvent) => {
    this.visStore.update(event.target);
  };

  handleFilterBarViewChange = (view?: VIEW) => {
    if (view === this.uiStore.view) {
      view = undefined;
    }

    this.props.onFilterBarViewChange(view);
  };

  render() {
    const { placeCircles, connectionLines, initialBounds } = this.visStore;
    const { view } = this.uiStore;

    return (
      <Map
        bounds={initialBounds}
        showTiles={view == null}
        // @ts-ignore outdated types
        whenReady={this.handleMapViewChange}
        onMoveEnd={this.handleMapViewChange}
        onZoomEnd={this.handleMapViewChange}
        onResize={this.handleMapViewChange}
      >
        <SVGLayer>
          <defs>
            <clipPath id="clip-path-circle" clipPathUnits="objectBoundingBox">
              <circle r="0.5" cx="0.5" cy="0.5" />
            </clipPath>
          </defs>
          <ConnectionLineList connectionLines={connectionLines} />
          <PlaceCircleList placeCircles={placeCircles} animate={false} />
          <CustomControl position="topleft">
            <FilterToolbar
              ui={this.uiStore}
              data={this.dataStore}
              onViewChange={this.handleFilterBarViewChange}
            />
          </CustomControl>
        </SVGLayer>
      </Map>
    );
  }
}

export default Visualisation;
