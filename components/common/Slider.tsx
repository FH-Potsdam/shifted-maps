import { Handles, Rail, Slider as BaseSlider, SliderItem, TrackItem, Tracks } from 'react-compound-slider';
import { HTMLAttributes } from 'react';
import styled from 'styled-components';

interface SliderProps {
  domain: ReadonlyArray<number>;
  values: ReadonlyArray<number>;
  handleLabels?: ReadonlyArray<string>;
  onUpdate?: (values: ReadonlyArray<number>) => void;
  onChange?: (values: ReadonlyArray<number>) => void;
  className?: string;
  step?: number;
  mode?: number;
}

const Slider = (props: SliderProps) => {
  const { handleLabels, ...sliderProps } = props;

  return (
    <BaseSlider {...sliderProps}>
      <Rail>{({ getRailProps }) => <SliderRail {...getRailProps()} />}</Rail>
      <Tracks left={false} right={false}>
        {({ tracks, getTrackProps }) => (
          <>
            {tracks.map(track => (
              <SliderTrack key={track.id} {...getTrackProps()} {...track} />
            ))}
          </>
        )}
      </Tracks>
      <Handles>
        {({ handles, getHandleProps }) => (
          <>
            {handles.map((handle, index) => (
              <SliderHandle
                key={handle.id}
                {...getHandleProps(handle.id)}
                {...handle}
                aria-label={handleLabels && handleLabels[index]}
                aria-valuemax={sliderProps.domain[1]}
                aria-valuemin={sliderProps.domain[0]}
                aria-valuenow={handle.value}
                role="slider"
                tabIndex={0}
              />
            ))}
          </>
        )}
      </Handles>
    </BaseSlider>
  );
};

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

type SliderHandleProps = SliderItem & Omit<HTMLAttributes<HTMLDivElement>, 'id'>;

const SliderHandle = styled(({ percent, ...props }: SliderHandleProps) => {
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
  return <div style={{ left: `${source.percent}%`, width: `${target.percent - source.percent}%` }} {...props} />;
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
