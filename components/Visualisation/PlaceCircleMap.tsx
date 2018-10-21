import classNames from 'classnames';
import { Browser } from 'leaflet';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Component } from 'react';

import config from '../../config';
import PlaceCircle from '../../stores/PlaceCircle';
import round from '../../stores/utils/round';
import styled from '../styled';
import PlaceCircleMapImage from './PlaceCircleMapImage';

interface IProps {
  placeCircle: PlaceCircle;
  maxRadius: number;
  className?: string;
}

const roundCoordinate = round(0.0001);

@observer
class PlaceCircleMap extends Component<IProps> {
  private cachedImages: PlaceCircleMapImage[] = [];

  @computed
  get imageRadius() {
    return this.props.maxRadius;
  }

  @computed
  get imageDiameter() {
    return this.imageRadius * 2;
  }

  @computed
  get href() {
    const { placeCircle } = this.props;
    const { zoom, latLngBounds } = placeCircle;
    const center = latLngBounds.getCenter();

    return `http://api.mapbox.com/v4/${config.mapboxStyleId}/${roundCoordinate(
      center.lng
    )},${roundCoordinate(center.lat)},${zoom}/${this.imageDiameter}x${this.imageDiameter}${
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
    const { key, radius, dots, hover } = placeCircle;

    const clipPathId = `clip-path-place-circle-${key}`;
    const lastDotIndex = dots.length - 1;

    return (
      <g className={classNames(className, { highlight: hover })}>
        <defs>
          <clipPath id={clipPathId}>
            <circle r={radius} cx={this.imageRadius} cy={this.imageRadius} />
          </clipPath>
        </defs>
        {this.images.map(image => (
          <image
            className={classNames({ active: image.loaded })}
            key={image.href}
            xlinkHref={image.href}
            clipPath={`url(#${clipPathId})`}
            width={this.imageDiameter}
            height={this.imageDiameter}
            transform={`translate(${this.imageRadius * -1}, ${this.imageRadius * -1})`}
          />
        ))}
        {dots.map((dot, index) => (
          <PlaceMapDot key={index} cx={dot.x} cy={dot.y} r={index === lastDotIndex ? 4 : 2.5} />
        ))}
      </g>
    );
  }
}

const PlaceMapDot = styled.circle`
  fill: ${props => props.theme.foregroundColor};
  stroke-width: 2;
  stroke: white;
`;

export default styled(PlaceCircleMap)`
  image {
    transition: opacity 400ms;
    opacity: 0;

    &.active {
      opacity: 1;
    }
  }

  &.highlight {
    ${PlaceMapDot} {
      fill: ${props => props.theme.highlightColor};
    }
  }
`;
