import { Component } from 'react';
import { observer } from 'mobx-react';
import { Browser } from 'leaflet';

import PlaceCircle from '../../store/PlaceCircle';
import config from '../../config';
import styled from '../styled';

const PlaceMapDot = styled.circle.attrs({
  r: 3,
})`
  fill: ${props => props.theme.foregroundColor};
  stroke-width: 2;
  stroke: white;
`;

type Props = {
  placeCircle: PlaceCircle;
};

@observer
class PlaceCircleMap extends Component<Props> {
  render() {
    const { diameter, latLngBounds, zoom, children } = this.props.placeCircle;
    const center = latLngBounds.getCenter();

    return (
      <g>
        <image
          clipPath="url(#clip-path-circle)"
          href={`http://api.tiles.mapbox.com/v4/${config.mapboxStyleId}/${center.lng},${
            center.lat
          },${zoom}/${diameter}x${diameter}${Browser.retina ? '@2x' : ''}.png?access_token=${
            config.mapboxAccessToken
          }`}
          width={diameter}
          height={diameter}
          transform={`translate(${diameter * -0.5}, ${diameter * -0.5})`}
        />
        {children.length === 0 && <PlaceMapDot />}
      </g>
    );
  }
}

export default PlaceCircleMap;
