import { Component } from 'react';
import { Map as ReactLeafletMap, TileLayer, MapProps } from 'react-leaflet';
import { inject, observer } from 'mobx-react';

import styled from '../styled';
import VisualisationStore from '../../store/VisualisationStore';
import config from '../../config';

type Props = {
  className?: string;
  children?: any;
  vis?: VisualisationStore;
};

@inject('vis')
@observer
class Map extends Component<Props & MapProps> {
  render() {
    const { className, children, vis, ...props } = this.props;
    const bounds = vis && vis.initialBounds;

    return (
      <ReactLeafletMap {...props} bounds={bounds} className={className} zoomControl={false}>
        <TileLayer
          opacity={0.5}
          url="https://api.tiles.mapbox.com/v4/{styleId}/{z}/{x}/{y}{r}.png?access_token={accessToken}"
          attribution={
            '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">&copy; OpenStreetMap</a>'
          }
          styleId={config.mapboxStyleId}
          accessToken={config.mapboxAccessToken}
        />
        {children}
      </ReactLeafletMap>
    );
  }
}

export default styled(Map)`
  font: inherit;
  color: ${props => props.theme.foregroundColor};
  z-index: 0;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background-color: ${props => props.theme.backgroundColor};
  transform: translate(0px);

  .leaflet-left .leaflet-control {
    margin-left: ${props => props.theme.spacingUnit}px;
  }

  .leaflet-top .leaflet-control {
    margin-top: ${props => props.theme.spacingUnit}px;
  }
`;
