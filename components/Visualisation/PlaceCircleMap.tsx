import classNames from 'classnames';
import { Browser } from 'leaflet';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Component } from 'react';

import config from '../../config';
import PlaceCircle from '../../stores/PlaceCircle';
import styled from '../styled';
import PlaceCircleMapImage from './PlaceCircleMapImage';

interface IProps {
  placeCircle: PlaceCircle;
  className?: string;
}

const normalizeCoordinate = (coordinate: number) => {
  return Math.round(coordinate * 10000) / 10000;
};

@observer
class PlaceCircleMap extends Component<IProps> {
  private cachedImages: PlaceCircleMapImage[] = [];

  @computed
  get href() {
    const { diameter, zoom, latLngBounds } = this.props.placeCircle;
    const center = latLngBounds.getCenter();

    return `http://api.tiles.mapbox.com/v4/${config.mapboxStyleId}/${normalizeCoordinate(
      center.lng
    )},${normalizeCoordinate(center.lat)},${zoom}/${diameter}x${diameter}${
      Browser.retina ? '@2x' : ''
    }.png?access_token=${config.mapboxAccessToken}`;
  }

  @computed
  get images() {
    const href = this.href;
    const images = [];

    let image = this.cachedImages.find(image => image.href === href);

    if (image == null) {
      image = new PlaceCircleMapImage(href);
    }

    const fallbackImages = this.cachedImages
      .filter(image => image.loaded && image.href !== href)
      .slice(0, 4);

    images.push(...fallbackImages, image);

    return (this.cachedImages = images);
  }

  render() {
    const { className, placeCircle } = this.props;
    const { children, diameter } = placeCircle;

    return (
      <g className={className}>
        {this.images.map(image => (
          <image
            className={classNames({ active: image.loaded })}
            key={image.href}
            xlinkHref={image.href}
            clipPath="url(#clip-path-circle)"
            width={diameter}
            height={diameter}
            transform={`translate(${diameter * -0.5}, ${diameter * -0.5})`}
          />
        ))}
        <PlaceMapDot style={{ display: children.length === 0 ? 'block' : 'none' }} />
      </g>
    );
  }
}

export default styled(PlaceCircleMap)`
  image {
    transition: opacity 400ms;
    opacity: 0;

    &.active {
      opacity: 1;
    }
  }
`;

const PlaceMapDot = styled.circle.attrs({
  r: 3,
})`
  fill: ${props => props.theme.foregroundColor};
  stroke-width: 2;
  stroke: white;
`;
