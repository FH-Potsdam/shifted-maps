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

const Map = () => {
  const router = useRouter();
  let view: VIEW | undefined;
  let timeSpan: ReadonlyArray<number> | undefined;
  let mapView: MapView | undefined;

  if (typeof router.query.timeSpan === 'string') {
    const [start, end] = router.query.timeSpan.split('-');

    if (start != null && end != null) {
      timeSpan = [Number(start), Number(end)];
    }
  }

  if (typeof router.query.view === 'string') {
    view = VIEW[router.query.view.toUpperCase()];
  }

  if (typeof router.query.center === 'string' && typeof router.query.zoom === 'string') {
    const [lat, lng] = router.query.center.split(',');

    if (lat != null && lng != null) {
      mapView = {
        center: [Number(lat), Number(lng)],
        zoom: Number(router.query.zoom),
      };
    }
  }

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

export default Map;
