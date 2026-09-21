import { Map as LeafletMap } from 'leaflet';
import debounce from 'lodash/fp/debounce';
import isEqual from 'lodash/fp/isEqual';
import { configure } from 'mobx';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import useTouch from '../../hooks/useTouch';
import useWidth from '../../hooks/useWidth';
import DataStore from '../../stores/DataStore';
import { DiaryData } from '../../stores/Diary';
import UIStore, { VIEW } from '../../stores/UIStore';
import VisualisationStore from '../../stores/VisualisationStore';
import FilterToolbar from './FilterToolbar/FilterToolbar';
import Map from './Map';
import SVGVisualisationLayer from './SVGVisualisationLayer';

configure({
  enforceActions: 'observed',
});

export interface MapView {
  center: [number, number];
  zoom: number;
}

interface VisualisationProps {
  data: DiaryData;
  mapView?: MapView;
  view?: VIEW;
  timeSpan?: ReadonlyArray<number>;
  onViewChange: (view?: VIEW) => void;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
  onMapViewChange: (mapView: MapView) => void;
  className?: string;
}

export enum DEVICE {
  mobile,
  tablet,
  desktop,
}

function createMapView(map: LeafletMap): MapView {
  const center = map.getCenter();
  const zoom = map.getZoom();

  return { center: [center.lat, center.lng], zoom };
}

function useDevice(defaultDevice: DEVICE): [DEVICE, (width: number) => void] {
  const [device, setDevice] = useState(defaultDevice);

  const callback = useCallback(
    (width: number) =>
      setDevice(() => {
        if (width >= 580) {
          return DEVICE.desktop;
        }

        if (width >= 440) {
          return DEVICE.tablet;
        }

        return DEVICE.mobile;
      }),
    []
  );

  return [device, callback];
}

function useDebounceCallback(callback: (mapView: MapView) => void, delay: number) {
  const debouncedCallback = useMemo(() => debounce(delay)(callback), [delay, callback]);

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}

const Visualisation = observer((props: VisualisationProps) => {
  const { view, data, timeSpan, className, mapView, onMapViewChange, onTimeSpanChange, onViewChange } = props;

  // Use memo to no reinitialize stores on every render.
  // TODO Use useRef with dependency array for semantic guarantee.
  // See https://reactjs.org/docs/hooks-reference.html#usememo
  const uiStore = useMemo(() => new UIStore(), []);
  const dataStore = useMemo(() => new DataStore(uiStore, data), [uiStore, data]);
  const visStore = useMemo(() => new VisualisationStore(uiStore, dataStore), [uiStore, dataStore]);

  useLayoutEffect(() => {
    uiStore.update({ view, timeSpan });
  }, [uiStore, view, timeSpan]);

  useEffect(
    () => () => {
      visStore.dispose();
    },
    [visStore]
  );

  const [map, setMap] = useState<LeafletMap | null>(null);

  useLayoutEffect(() => {
    if (map != null) {
      visStore.updateProjection(map);
    }
  }, [map, visStore]);

  const touch = useTouch();
  const [device, updateDevice] = useDevice(DEVICE.desktop);

  const handleWidthChange = useCallback(
    (width: number) => {
      visStore.updateWidth(width);
      updateDevice(width);
    },
    [visStore, updateDevice]
  );
  const measureRef = useWidth<HTMLDivElement>(handleWidthChange);

  const handleWhenReady = useCallback((readyMap: LeafletMap) => {
    setMap(readyMap);
  }, []);

  const debounceOnMapViewChange = useDebounceCallback(onMapViewChange, 200);

  const handleMapViewDidChange = useCallback(
    (map: LeafletMap) => {
      const prevMapView = mapView;
      const nextMapView = createMapView(map);

      if (isEqual(prevMapView, nextMapView)) {
        return;
      }

      visStore.updateProjection(map);
      debounceOnMapViewChange(nextMapView);
    },
    [mapView, visStore, debounceOnMapViewChange]
  );

  const handleZoomStart = useCallback(() => {
    visStore.graph.stop();
  }, [visStore]);

  const handleClick = () => {
    visStore.deactivateElement();
  };

  const { initialBounds } = visStore;
  const listener = touch ? { onClick: handleClick } : {};
  const mapProps = mapView != null ? mapView : { bounds: initialBounds };

  return (
    <div ref={measureRef} className={className} {...listener}>
      <Map
        {...mapProps}
        showTiles={view == null}
        onMapReady={handleWhenReady}
        onMapViewChange={handleMapViewDidChange}
        onMapZoomStart={handleZoomStart}
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
