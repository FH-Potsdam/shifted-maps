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
    height: 2px;
    background-color: ${props => props.theme.foregroundColor};
    opacity: 0.2;
  }
`;

const SliderHandle = styled(({ percent, ...props }: SliderItem) => {
  return <div style={{ left: `${percent}%` }} {...props} />;
})`
  width: 32px;
  height: 32px;
  position: absolute;
  top: 0;
  transform: translate(-16px, -8px);

  &:after {
    content: '';
    position: absolute;
    top: 11px;
    left: 11px;
    width: 10px;
    height: 10px;
    background-color: ${props => props.theme.foregroundColor};
    border-radius: 50%;
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
    height: 2px;
    background-color: ${props => props.theme.foregroundColor};
  }
`;
