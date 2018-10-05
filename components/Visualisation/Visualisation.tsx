import { Component, Fragment } from 'react';
import { configure, action } from 'mobx';
import { Provider, observer } from 'mobx-react';
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
import UIStore from '../../store/UIStore';

type Props = {
  data: DiaryData;
};

configure({
  enforceActions: 'observed',
});

export type Stores = {
  data?: DataStore;
  vis?: VisualisationStore;
  ui?: UIStore;
};

@observer
class Visualisation extends Component<Props> {
  dataStore: DataStore;
  visStore: VisualisationStore;
  uiStore: UIStore;

  constructor(props: Props) {
    super(props);

    this.uiStore = new UIStore();
    this.dataStore = new DataStore(this.uiStore, props.data);
    this.visStore = new VisualisationStore(this.uiStore, this.dataStore);
  }

  @action.bound
  handleViewChange(event: LeafletEvent) {
    this.visStore.update(event.target);
  }

  @action.bound
  handleFilterToolbarUpdate() {
    this.visStore.toggleAnimate(true);
  }

  render() {
    return (
      <Provider ui={this.uiStore} data={this.dataStore} vis={this.visStore}>
        <Fragment>
          <Map
            // @ts-ignore outdated types
            whenReady={this.handleViewChange}
            onMoveEnd={this.handleViewChange}
            onZoomEnd={this.handleViewChange}
            onResize={this.handleViewChange}
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
                <FilterToolbar />
              </CustomControl>
            </SVGLayer>
          </Map>
        </Fragment>
      </Provider>
    );
  }
}

export default Visualisation;
