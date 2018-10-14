import { LeafletEvent, Map as LeafletMap } from 'leaflet';
import { action, configure } from 'mobx';
import { observer } from 'mobx-react';
import { Component, Fragment } from 'react';

import DataStore from '../../stores/DataStore';
import { DiaryData } from '../../stores/Diary';
import UIStore, { VIEW } from '../../stores/UIStore';
import VisualisationStore from '../../stores/VisualisationStore';
import FilterToolbar from './FilterToolbar';
import Map from './Map';
import SVGVisualisationLayer from './SVGVisualisationLayer';

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

  constructor(props: IProps) {
    super(props);

    const { view, data, timeSpan } = props;

    this.uiStore = new UIStore();
    this.dataStore = new DataStore(this.uiStore, data);
    this.visStore = new VisualisationStore(this.uiStore, this.dataStore);

    this.uiStore.update({ view, timeSpan });
  }

  @action
  componentDidUpdate() {
    const { view, timeSpan } = this.props;

    this.uiStore.update({ view, timeSpan });
    this.visStore.update(this.map);
  }

  componentWillUnmount() {
    this.visStore.dispose();
  }

  @action
  handleMapViewDidChange = (event: LeafletEvent) => {
    this.map = event.target;
    this.visStore.update(this.map);
  };

  @action
  handleZoomStart = () => {
    this.visStore.graph.stop();
  };

  render() {
    const { initialBounds } = this.visStore;
    const { view } = this.uiStore;
    const { onFilterBarViewChange } = this.props;

    return (
      <Fragment>
        <Map
          bounds={initialBounds}
          showTiles={view == null}
          // @ts-ignore outdated types
          whenReady={this.handleMapViewDidChange}
          onZoomEnd={this.handleMapViewDidChange}
          onResize={this.handleMapViewDidChange}
          onZoomStart={this.handleZoomStart}
        >
          <SVGVisualisationLayer vis={this.visStore} />
        </Map>
        <FilterToolbar
          ui={this.uiStore}
          data={this.dataStore}
          onViewChange={onFilterBarViewChange}
        />
      </Fragment>
    );
  }
}

export default Visualisation;
