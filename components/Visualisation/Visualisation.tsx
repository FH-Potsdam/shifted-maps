import { LeafletEvent, Map as LeafletMap } from 'leaflet';
import { action, configure } from 'mobx';
import { observer } from 'mobx-react';
import { Component } from 'react';

import DataStore from '../../stores/DataStore';
import { DiaryData } from '../../stores/Diary';
import UIStore, { VIEW } from '../../stores/UIStore';
import VisualisationStore from '../../stores/VisualisationStore';
import styled from '../styled';
import FilterToolbar from './FilterToolbar';
import Map from './Map';
import SVGVisualisationLayer from './SVGVisualisationLayer';

configure({
  enforceActions: 'observed',
});

interface IProps {
  data: DiaryData;
  view?: VIEW;
  timeSpan?: ReadonlyArray<number>;
  onViewChange: (view?: VIEW) => void;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
  className?: string;
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
    this.uiStore.update({ view, timeSpan });

    this.dataStore = new DataStore(this.uiStore, data);
    this.visStore = new VisualisationStore(this.uiStore, this.dataStore);
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

  render() {
    const { initialBounds } = this.visStore;
    const { view } = this.uiStore;
    const { className, onViewChange, onTimeSpanChange } = this.props;

    return (
      <div className={className}>
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
          onViewChange={onViewChange}
          onTimeSpanChange={onTimeSpanChange}
        />
      </div>
    );
  }

  @action
  private handleMapViewDidChange = (event: LeafletEvent) => {
    this.map = event.target;
    this.visStore.update(this.map);
  };

  @action
  private handleZoomStart = () => {
    this.visStore.graph.stop();
  };
}

export default styled(Visualisation)``;
