import { LeafletEvent, Map as LeafletMap } from 'leaflet';
import debounce from 'lodash/fp/debounce';
import isEqual from 'lodash/fp/isEqual';
import { action, configure, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Component } from 'react';
import Measure, { ContentRect } from 'react-measure';

import DataStore from '../../stores/DataStore';
import { DiaryData } from '../../stores/Diary';
import UIStore, { VIEW } from '../../stores/UIStore';
import VisualisationStore from '../../stores/VisualisationStore';
import Touch from '../common/Touch';
import styled from '../styled';
import FilterToolbar from './FilterToolbar';
import Map from './Map';
import SVGVisualisationLayer from './SVGVisualisationLayer';

configure({
  enforceActions: 'observed',
});

export interface IMapView {
  center: [number, number];
  zoom: number;
}

interface IProps {
  data: DiaryData;
  mapView?: IMapView;
  view?: VIEW;
  timeSpan?: ReadonlyArray<number>;
  onViewChange: (view?: VIEW) => void;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
  onMapViewChange: (mapView: IMapView) => void;
  className?: string;
}

export enum DEVICE {
  mobile,
  tablet,
  desktop,
}

function createMapView(map: LeafletMap): IMapView {
  const center = map.getCenter();
  const zoom = map.getZoom();

  return { center: [center.lat, center.lng], zoom };
}

@observer
class Visualisation extends Component<IProps> {
  @observable
  device: DEVICE = DEVICE.desktop;

  private dataStore: DataStore;
  private visStore: VisualisationStore;
  private uiStore: Readonly<UIStore>;
  private map?: LeafletMap;

  private debounceOnMapViewChange = debounce(200)(this.props.onMapViewChange);

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

    if (this.map != null) {
      this.visStore.updateMap(this.map);
    }
  }

  componentWillUnmount() {
    this.visStore.dispose();
  }

  render() {
    const { initialBounds } = this.visStore;
    const { view } = this.uiStore;
    const { mapView, className, onViewChange, onTimeSpanChange } = this.props;

    const mapProps = mapView != null ? mapView : { bounds: initialBounds };

    return (
      <Measure bounds onResize={this.handleResize}>
        {({ measureRef }) => (
          <Touch>
            {touch => {
              const listener = touch ? { onClick: this.handleClick } : {};

              return (
                <div ref={measureRef} className={className} {...listener}>
                  <Map
                    {...mapProps}
                    showTiles={view == null}
                    // @ts-ignore Broken types
                    whenReady={this.handleWhenReady}
                    onZoomEnd={this.handleMapViewDidChange}
                    onMoveEnd={this.handleMapViewDidChange}
                    onResize={this.handleMapViewDidChange}
                    onZoomStart={this.handleZoomStart}
                  >
                    <SVGVisualisationLayer vis={this.visStore} touch={touch} device={this.device} />
                  </Map>
                  <FilterToolbar
                    ui={this.uiStore}
                    data={this.dataStore}
                    onViewChange={onViewChange}
                    onTimeSpanChange={onTimeSpanChange}
                    device={this.device}
                  />
                </div>
              );
            }}
          </Touch>
        )}
      </Measure>
    );
  }

  @action
  private handleWhenReady = (event: LeafletEvent) => {
    this.map = event.target;

    if (this.map == null) {
      return;
    }

    this.visStore.updateMap(this.map);
  };

  @action
  private handleMapViewDidChange = (event: LeafletEvent) => {
    this.map = event.target;

    if (this.map == null) {
      return;
    }

    const { mapView: prevMapView } = this.props;
    const mapView = createMapView(this.map);

    if (isEqual(prevMapView, mapView)) {
      return;
    }

    this.visStore.updateMap(this.map);
    this.debounceOnMapViewChange(mapView);
  };
  @action
  private handleZoomStart = () => {
    this.visStore.graph.stop();
  };

  @action
  private handleClick = () => {
    this.visStore.deactivateElement();
  };

  @action
  private handleResize = (contentRect: ContentRect) => {
    const { width } = contentRect.bounds!;
    let device;

    if (width >= 580) {
      device = DEVICE.desktop;
    } else if (width >= 440) {
      device = DEVICE.tablet;
    } else {
      device = DEVICE.mobile;
    }

    this.device = device;
    this.visStore.updateWidth(width);
  };
}

export default styled(Visualisation)``;
