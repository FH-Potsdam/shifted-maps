import classNames from 'classnames';
import { Browser } from 'leaflet';
import { observer } from 'mobx-react';
import { useMemo, useRef } from 'react';
import styled from 'styled-components';
import PlaceCircle from '../../stores/PlaceCircle';
import round from '../../stores/utils/round';
import VisualisationStore from '../../stores/VisualisationStore';
import PlaceCircleMapImage from './PlaceCircleMapImage';

interface PlaceCircleMapProps {
  placeCircle: PlaceCircle;
  vis: VisualisationStore;
  className?: string;
}

const roundCoordinate = round(0.0001);

const PlaceCircleMap = observer(({ className, placeCircle, vis }: PlaceCircleMapProps) => {
  const { key, radius, dots, active, dotRadius, zoom, latLngBounds } = placeCircle;
  const clipPathId = `clip-path-place-circle-${key}`;
  const lastDotIndex = dots.length - 1;
  const { maxPlaceCircleRadius: imageRadius } = vis;

  if (imageRadius == null) {
    throw new Error('Missing max place circle radius.');
  }

  const cachedImagesRef = useRef<PlaceCircleMapImage[]>([]);
  const imageDiameter = imageRadius * 2;

  const href = useMemo(() => {
    const center = latLngBounds.getCenter();

    return `https://api.mapbox.com/styles/v1/${process.env.mapboxStaticStyleId}/static/${roundCoordinate(
      center.lng
    )},${roundCoordinate(center.lat)},${zoom}/${imageDiameter}x${imageDiameter}${
      Browser.retina ? '@2x' : ''
    }?access_token=${process.env.mapboxAccessToken}`;
  }, [zoom, latLngBounds, imageDiameter]);

  const images = useMemo(() => {
    const images = [];
    let image = cachedImagesRef.current.find(image => image.href === href);

    if (image == null) {
      image = new PlaceCircleMapImage(href);
    }

    const fallbackImages = cachedImagesRef.current.filter(image => image.loaded && image.href !== href);
    images.push(...fallbackImages, image);

    return (cachedImagesRef.current = images);
  }, [href]);

  return (
    <g className={classNames(className, { highlight: active })}>
      <defs>
        <clipPath id={clipPathId}>
          <circle r={radius} cx={imageRadius} cy={imageRadius} />
        </clipPath>
      </defs>
      {images.map(image => (
        <image
          className={classNames({ active: image.loaded })}
          key={image.href}
          xlinkHref={image.href}
          clipPath={`url(#${clipPathId})`}
          width={imageDiameter}
          height={imageDiameter}
          transform={`translate(${imageRadius * -1}, ${imageRadius * -1})`}
        />
      ))}
      {dots.map((dot, index) => (
        <PlaceMapDot key={index} cx={dot.x} cy={dot.y} r={index === lastDotIndex ? dotRadius : dotRadius * 0.625} />
      ))}
    </g>
  );
});

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
