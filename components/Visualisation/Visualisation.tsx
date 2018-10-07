import { Component, Fragment } from 'react';
import { configure, action } from 'mobx';
import { Provider, observer } from 'mobx-react';
import { LeafletEvent, Map as LeafletMap } from 'leaflet';

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

export type Stores = {
  data?: DataStore;
  vis?: VisualisationStore;
  ui?: UIStore;
};

type Props = {
  data: DiaryData;
  view?: VIEW;
  timeSpan?: [number, number];
  onFilterBarViewChange: (view: VIEW) => void;
};

@observer
class Visualisation extends Component<Props> {
  dataStore: DataStore;
  visStore: VisualisationStore;
  uiStore: UIStore;

  map?: LeafletMap;

  constructor(props: Props) {
    super(props);

    this.uiStore = new UIStore();
    this.dataStore = new DataStore(this.uiStore);
    this.visStore = new VisualisationStore(this.uiStore, this.dataStore);

    this.dataStore.update(props.data);
  }

  componentDidUpdate() {
    const { view, data, timeSpan } = this.props;

    this.uiStore.update({ view, timeSpan });
    this.dataStore.update(data);

    if (this.map != null) {
      this.visStore.update(this.map);
    }
  }

  @action
  handleMapViewChange = (event: LeafletEvent) => {
    this.map = event.target;

    if (this.map != null) {
      this.visStore.update(this.map);
    }
  };

  render() {
    return (
      <Provider ui={this.uiStore} data={this.dataStore} vis={this.visStore}>
        <Fragment>
          <Map
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
              <ConnectionLineList />
              <PlaceCircleList />
              <CustomControl position="topleft">
                <FilterToolbar onViewChange={this.props.onFilterBarViewChange} />
              </CustomControl>
            </SVGLayer>
          </Map>
        </Fragment>
      </Provider>
    );
  }
}

export default Visualisation;
