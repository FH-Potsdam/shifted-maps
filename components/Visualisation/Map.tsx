import { Map as LeafletMap } from 'leaflet';
import { observer } from 'mobx-react';
import { ReactNode, useEffect } from 'react';
import { AttributionControl, MapContainer, MapContainerProps, TileLayer, useMapEvents } from 'react-leaflet';
import styled from 'styled-components';

interface MapProps extends Omit<MapContainerProps, 'whenCreated' | 'whenReady'> {
  children?: ReactNode;
  showTiles: boolean;
  onMapReady: (map: LeafletMap) => void;
  onMapViewChange: (map: LeafletMap) => void;
  onMapZoomStart: () => void;
}

interface MapEventsProps {
  onMapReady: (map: LeafletMap) => void;
  onMapViewChange: (map: LeafletMap) => void;
  onMapZoomStart: () => void;
}

const MapEvents = ({ onMapReady, onMapViewChange, onMapZoomStart }: MapEventsProps) => {
  const map = useMapEvents({
    moveend: () => onMapViewChange(map),
    resize: () => onMapViewChange(map),
    zoomend: () => onMapViewChange(map),
    zoomstart: onMapZoomStart,
  });

  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute('aria-label', 'Movement map');
    container.setAttribute('role', 'region');
    map.whenReady(() => onMapReady(map));
  }, [map, onMapReady]);

  return null;
};

const Map = observer(({ children, showTiles, onMapReady, onMapViewChange, onMapZoomStart, ...props }: MapProps) => {
  const tileUrl = `https://api.mapbox.com/styles/v1/${process.env.mapboxStaticStyleId}/tiles/{z}/{x}/{y}?access_token=${process.env.mapboxAccessToken}`;

  return (
    <MapContainer {...props} zoomControl={false} attributionControl={false}>
      <TileLayer
        opacity={showTiles ? 0.25 : 0}
        url={tileUrl}
        attribution={
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
        tileSize={512}
        maxZoom={18}
        zoomOffset={-1}
      />
      <AttributionControl prefix={`Version: ${process.env.version}`} />
      <MapEvents onMapReady={onMapReady} onMapViewChange={onMapViewChange} onMapZoomStart={onMapZoomStart} />
      {children}
    </MapContainer>
  );
});

// https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/13.3842,52.5114,11/600x600@2x.png?access_token=pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw
// https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-115.84178,37.21776,12/556x556@2x?access_token=pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw

export default styled(Map)`
  font: inherit;
  color: ${(props) => props.theme.foregroundColor};
  z-index: 0;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  transform: translate(0px);

  &.leaflet-container {
    background-color: ${(props) => props.theme.backgroundColor};
  }

  .leaflet-left .leaflet-control {
    margin-left: ${(props) => props.theme.spacingUnit}px;
  }

  .leaflet-top .leaflet-control {
    margin-top: ${(props) => props.theme.spacingUnit}px;
  }

  .leaflet-layer {
    transition: opacity ${(props) => props.theme.shortTransitionDuration};
  }
`;
