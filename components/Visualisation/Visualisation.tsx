import { LeafletEvent, Map as LeafletMap } from 'leaflet';
import debounce from 'lodash/fp/debounce';
import isEqual from 'lodash/fp/isEqual';
import { configure } from 'mobx';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import useTouch from '../../hooks/useTouch';
import useWidth from '../../hooks/useWidth';
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

function useUIStore() {
  const uiStoreRef = useRef<UIStore>();

  if (uiStoreRef.current == null) {
    uiStoreRef.current = new UIStore();
  }

  return uiStoreRef.current;
}

function useDataStore(uiStore: UIStore, data: DiaryData) {
  return useMemo(() => {
    return new DataStore(uiStore, data);
  }, [uiStore, data]);
}

function useVisStore(uiStore: UIStore, dataStore: DataStore) {
  return useMemo(() => {
    return new VisualisationStore(uiStore, dataStore);
  }, [uiStore, dataStore]);
}

function useDevice(defaultDevice: DEVICE): [DEVICE, (width: number) => void] {
  const [device, setDevice] = useState(defaultDevice);

  return [
    device,
    width =>
      setDevice(() => {
        if (width >= 580) {
          return DEVICE.desktop;
        }

        if (width >= 440) {
          return DEVICE.tablet;
        }

        return DEVICE.mobile;
      }),
  ];
}

const Visualisation = observer((props: IProps) => {
  const {
    view,
    data,
    timeSpan,
    className,
    mapView,
    onMapViewChange,
    onTimeSpanChange,
    onViewChange,
  } = props;

  const uiStore = useUIStore();
  const dataStore = useDataStore(uiStore, data);
  const visStore = useVisStore(uiStore, dataStore);

  useLayoutEffect(() => {
    uiStore.update({ view, timeSpan });
  });

  useEffect(
    () => () => {
      visStore.dispose();
    },
    []
  );

  const mapRef = useRef<LeafletMap>();

  useLayoutEffect(() => {
    if (mapRef.current != null) {
      visStore.updateProjection(mapRef.current);
    }
  });

  const touch = useTouch();
  const [device, updateDevice] = useDevice(DEVICE.desktop);

  const measureRef = useWidth<HTMLDivElement>(width => {
    visStore.updateWidth(width);
    updateDevice(width);
  });

  const handleWhenReady = useCallback((event: LeafletEvent) => {
    const map = (mapRef.current = event.target!);
    visStore.updateProjection(map);
  }, []);

  const debounceOnMapViewChange = useCallback(debounce(200)(onMapViewChange), [onMapViewChange]);

  const handleMapViewDidChange = useCallback(
    (event: LeafletEvent) => {
      const map = (mapRef.current = event.target!);
      const prevMapView = mapView;
      const nextMapView = createMapView(map);

      if (isEqual(prevMapView, nextMapView)) {
        return;
      }

      visStore.updateProjection(map);
      debounceOnMapViewChange(nextMapView);
    },
    [mapView]
  );

  const handleZoomStart = useCallback(() => {
    visStore.graph.stop();
  }, [visStore]);

  const handleClick = useCallback(() => {
    visStore.deactivateElement();
  }, [visStore]);

  const { initialBounds } = visStore;
  const listener = touch ? { onClick: handleClick } : {};
  const mapProps = mapView != null ? mapView : { bounds: initialBounds };

  return (
    <div ref={measureRef} className={className} {...listener}>
      <Map
        {...mapProps}
        showTiles={view == null}
        // @ts-ignore Broken types
        whenReady={handleWhenReady}
        onZoomEnd={handleMapViewDidChange}
        onMoveEnd={handleMapViewDidChange}
        onResize={handleMapViewDidChange}
        onZoomStart={handleZoomStart}
      >
        <SVGVisualisationLayer vis={visStore} touch={touch} device={device} />
      </Map>
      <FilterToolbar
        ui={uiStore}
        data={dataStore}
        onViewChange={onViewChange}
        onTimeSpanChange={onTimeSpanChange}
        device={device}
      />
    </div>
  );
});

export default styled(Visualisation)``;
