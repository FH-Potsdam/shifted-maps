import { Fragment } from 'react';
import {
  Handles,
  Rail,
  Slider as BaseSlider,
  SliderItem,
  TrackItem,
  Tracks,
} from 'react-compound-slider';

import styled from '../styled';

interface IProps {
  domain: ReadonlyArray<number>;
  values: ReadonlyArray<number>;
  onUpdate?: (values: ReadonlyArray<number>) => void;
  onChange?: (values: ReadonlyArray<number>) => void;
  className?: string;
  step?: number;
  mode?: number;
}

function Slider(props: IProps) {
  return (
    <BaseSlider {...props}>
      <Rail>{({ getRailProps }) => <SliderRail {...getRailProps()} />}</Rail>
      <Tracks left={false} right={false}>
        {({ tracks, getTrackProps }) => (
          <Fragment>
            {tracks.map(track => (
              <SliderTrack key={track.id} {...getTrackProps()} {...track} />
            ))}
          </Fragment>
        )}
      </Tracks>
      <Handles>
        {({ handles, getHandleProps }) => (
          <Fragment>
            {handles.map(handle => (
              <SliderHandle key={handle.id} {...getHandleProps(handle.id)} {...handle} />
            ))}
          </Fragment>
        )}
      </Handles>
    </BaseSlider>
  );
}

export default styled(Slider)`
  position: relative;
  height: 16px;
`;

const SliderRail = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &:after {
    content: '';
    position: absolute;
    top: 7px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: ${props => props.theme.foregroundColor};
    opacity: 0.2;
  }
`;

const SliderHandle = styled(({ percent, ...props }: SliderItem) => {
  return <div style={{ left: `${percent}%` }} {...props} />;
})`
  transition: transform ${props => props.theme.shortTransitionDuration};
  width: 32px;
  height: 32px;
  position: absolute;
  top: 0;
  transform: translate(-16px, -8px);
  cursor: pointer;
  touch-action: pan-x;

  &:after {
    transition: color ${props => props.theme.shortTransitionDuration};
    content: '';
    position: absolute;
    top: 12px;
    left: 12px;
    width: 8px;
    height: 8px;
    background-color: currentColor;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }

  &:hover {
    transform: translate(-16px, -8px) scale(1.2);

    &:after {
      background-color: ${props => props.theme.highlightColor};
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
    }
  }
`;

const SliderTrack = styled(({ source, target, ...props }: TrackItem) => {
  return (
    <div
      style={{ left: `${source.percent}%`, width: `${target.percent - source.percent}%` }}
      {...props}
    />
  );
})`
  position: absolute;
  top: 0;
  height: 100%;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 7px;
    width: 100%;
    height: 1px;
    background-color: currentColor;
  }
`;
