import { Browser } from 'leaflet';
import debounce from 'lodash/fp/debounce';
import { action, computed, observable } from 'mobx';
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

@observer
class PlaceCircleMap extends Component<IProps> {
  private cachedImages: PlaceCircleMapImage[] = [];

  @observable
  private activeHref?: string;

  private handleImageLoaded = debounce(10)(
    action(() => {
      this.activeHref = this.href;
    })
  );

  @computed
  get href() {
    const { diameter, zoom, latLngBounds } = this.props.placeCircle;
    const center = latLngBounds.getCenter();

    return `http://api.tiles.mapbox.com/v4/${config.mapboxStyleId}/${center.lng},${
      center.lat
    },${zoom}/${diameter}x${diameter}${Browser.retina ? '@2x' : ''}.png?access_token=${
      config.mapboxAccessToken
    }`;
  }

  @computed
  get images() {
    const href = this.href;
    const index = this.cachedImages.findIndex(image => image.href === href);

    if (index === -1) {
      const image = new PlaceCircleMapImage(href, this.handleImageLoaded);
      this.cachedImages.push(image);

      while (this.cachedImages.length > 2) {
        this.cachedImages.shift();
      }
    } else {
      this.handleImageLoaded();
    }

    return this.cachedImages;
  }

  render() {
    const { className, placeCircle } = this.props;
    const { children, diameter } = placeCircle;

    return (
      <g className={className}>
        {this.images.map(image => (
          <image
            className={this.activeHref === image.href ? 'active' : ''}
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
