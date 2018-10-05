import { Component } from 'react';
import { configure, action } from 'mobx';
import { Provider, observer } from 'mobx-react';
import { LeafletEvent } from 'leaflet';

import { DiaryData } from '../../store/Diary';
import DataStore from '../../store/DataStore';
import Map from './Map';
import SVGLayer from './SVGLayer';
import PlaceCircleList from './PlaceCircleList';
import VisualisationStore from '../../store/VisualisationStore';

type Props = {
  data: DiaryData;
};

configure({
  enforceActions: 'observed',
});

export type Stores = {
  data?: DataStore;
  vis?: VisualisationStore;
};

@observer
class Visualisation extends Component<Props> {
  dataStore: DataStore;
  visStore: VisualisationStore;

  constructor(props: Props) {
    super(props);

    this.dataStore = new DataStore(props.data);
    this.visStore = new VisualisationStore(this.dataStore);
  }

  @action.bound
  handleViewChange(event: LeafletEvent) {
    this.visStore.update(event.target);
  }

  render() {
    return (
      <Provider data={this.dataStore} vis={this.visStore}>
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
            <PlaceCircleList />
          </SVGLayer>
        </Map>
      </Provider>
    );
  }
}

export default Visualisation;
