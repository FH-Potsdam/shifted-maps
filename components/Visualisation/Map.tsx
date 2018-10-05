import { Component } from 'react';
import { Map as ReactLeafletMap, TileLayer, MapProps } from 'react-leaflet';
import { inject, observer } from 'mobx-react';

import styled from '../styled';
import VisualisationStore from '../../store/VisualisationStore';

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
          url="https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}{r}.png?access_token={accessToken}"
          attribution={
            '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">&copy; OpenStreetMap</a>'
          }
          id="heike.6bac2bcd"
          accessToken="pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw"
        />
        {children}
      </ReactLeafletMap>
    );
  }
}

export default styled(Map)`
  z-index: 0;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background-color: ${props => props.theme.backgroundColor};
  transform: translate(0px);
`;
