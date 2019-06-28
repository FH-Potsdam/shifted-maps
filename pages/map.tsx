import { NextStatelessComponent } from 'next';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { useCallback } from 'react';

import { IMapView } from '../components/Visualisation/Visualisation';
import demo from '../static/data/demo.json';
import { DiaryData } from '../stores/Diary';
import { VIEW } from '../stores/UIStore';

const DynamicVisualisation = dynamic({
  loader: () => import('../components/Visualisation/Visualisation'),
  loading: () => null,
  ssr: false,
});

interface IProps {
  data: DiaryData;
  view?: VIEW;
  timeSpan?: ReadonlyArray<number>;
  mapView?: IMapView;
}

const Map: NextStatelessComponent<IProps> = props => {
  const { data, view, timeSpan, mapView } = props;

  const handleViewChange = useCallback((view?: VIEW) => {
    const query: { view?: string } = {
      ...Router.query,
    };

    if (view != null) {
      query.view = VIEW[view].toLowerCase();
    } else {
      delete query.view;
    }

    Router.push({ pathname: '/map', query });
  }, []);

  const handleTimeSpanChange = useCallback((timeSpan: ReadonlyArray<number>) => {
    const query = {
      ...Router.query,
      timeSpan: timeSpan.join('-'),
    };

    Router.push({ pathname: '/map', query });
  }, []);

  const handleMapViewChange = useCallback(({ center, zoom }: IMapView) => {
    const query = {
      ...Router.query,
      center: center.join(','),
      zoom,
    };

    Router.replace({ pathname: '/map', query });
  }, []);

  return (
    <DynamicVisualisation
      data={data}
      view={view}
      timeSpan={timeSpan}
      mapView={mapView}
      onViewChange={handleViewChange}
      onTimeSpanChange={handleTimeSpanChange}
      onMapViewChange={handleMapViewChange}
    />
  );
};

Map.getInitialProps = ({ query }) => {
  let timeSpan: ReadonlyArray<number> | undefined;
  let view: VIEW | undefined;
  let mapView: IMapView | undefined;

  if (typeof query.timeSpan === 'string') {
    const [start, end] = query.timeSpan.split('-');

    if (start != null && end != null) {
      timeSpan = [Number(start), Number(end)];
    }
  }

  if (typeof query.view === 'string') {
    view = VIEW[query.view.toUpperCase()];
  }

  if (typeof query.center === 'string' && typeof query.zoom === 'string') {
    const [lat, lng] = query.center.split(',');

    if (lat != null && lng != null) {
      mapView = {
        center: [Number(lat), Number(lng)],
        zoom: Number(query.zoom),
      };
    }
  }

  return {
    data: demo,
    mapView,
    timeSpan,
    view,
  };
};

export default Map;
