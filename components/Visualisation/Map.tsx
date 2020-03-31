import { LatLngBounds } from 'leaflet';
import { observer } from 'mobx-react';
import { AttributionControl, Map as ReactLeafletMap, MapProps as LeafletMapProps, TileLayer } from 'react-leaflet';
import styled from 'styled-components';
import Head from 'next/head';

interface MapProps {
  className?: string;
  children?: any;
  bounds: LatLngBounds;
  showTiles: boolean;
}

const Map = observer(({ className, children, showTiles, ...props }: MapProps & LeafletMapProps) => {
  return (
    <ReactLeafletMap {...props} className={className} zoomControl={false} attributionControl={false}>
      <Head>
        <link
          key="mapbox-styles"
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
          integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
          crossOrigin=""
        />
      </Head>
      <TileLayer
        opacity={showTiles ? 0.25 : 0}
        url="https://api.mapbox.com/styles/v1/{styleId}/tiles/{z}/{x}/{y}?access_token={accessToken}"
        attribution={
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
        styleId={process.env.mapboxStaticStyleId}
        accessToken={process.env.mapboxAccessToken}
        tileSize={512}
        maxZoom={18}
        zoomOffset={-1}
      />
      <AttributionControl prefix={`Version: ${process.env.version}`} />
      {children}
    </ReactLeafletMap>
  );
});

// https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/13.3842,52.5114,11/600x600@2x.png?access_token=pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw
// https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-115.84178,37.21776,12/556x556@2x?access_token=pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw

export default styled(Map)`
  font: inherit;
  color: ${props => props.theme.foregroundColor};
  z-index: 0;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  transform: translate(0px);

  &.leaflet-container {
    background-color: ${props => props.theme.backgroundColor};
  }

  .leaflet-left .leaflet-control {
    margin-left: ${props => props.theme.spacingUnit}px;
  }

  .leaflet-top .leaflet-control {
    margin-top: ${props => props.theme.spacingUnit}px;
  }

  .leaflet-layer {
    transition: opacity ${props => props.theme.shortTransitionDuration};
  }
`;
