import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { MapView } from '../components/Visualisation/Visualisation';
import data from '../data/demo.json';
import { VIEW } from '../stores/UIStore';

const DynamicVisualisation = dynamic({
  loader: () => import('../components/Visualisation/Visualisation'),
  loading: () => null,
  ssr: false,
});

interface MapProps {
  view?: VIEW;
  timeSpan?: ReadonlyArray<number>;
  mapView?: MapView;
}

const Map = (props: MapProps) => {
  const { view, timeSpan, mapView } = props;
  const router = useRouter();

  const handleViewChange = useCallback(
    (view?: VIEW) => {
      const query: { view?: string } = {
        ...router.query,
      };

      if (view != null) {
        query.view = VIEW[view].toLowerCase();
      } else {
        delete query.view;
      }

      router.push({ pathname: '/map', query });
    },
    [router]
  );

  const handleTimeSpanChange = useCallback(
    (timeSpan: ReadonlyArray<number>) => {
      router.push({
        pathname: '/map',
        query: {
          ...router.query,
          timeSpan: timeSpan.join('-'),
        },
      });
    },
    [router]
  );

  const handleMapViewChange = useCallback(
    ({ center, zoom }: MapView) => {
      const query = {
        center: center.join(','),
        zoom: String(zoom),
      };

      router.push({
        pathname: '/map',
        query: {
          ...router.query,
          ...query,
        },
      });
    },
    [router]
  );

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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const props: Partial<MapProps> = {};

  if (typeof query.timeSpan === 'string') {
    const [start, end] = query.timeSpan.split('-');

    if (start != null && end != null) {
      props.timeSpan = [Number(start), Number(end)];
    }
  }

  if (typeof query.view === 'string') {
    props.view = VIEW[query.view.toUpperCase()];
  }

  if (typeof query.center === 'string' && typeof query.zoom === 'string') {
    const [lat, lng] = query.center.split(',');

    if (lat != null && lng != null) {
      props.mapView = {
        center: [Number(lat), Number(lng)],
        zoom: Number(query.zoom),
      };
    }
  }

  return {
    props,
  };
};

export default Map;
