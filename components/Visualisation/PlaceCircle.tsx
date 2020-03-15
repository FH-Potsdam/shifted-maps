import classNames from 'classnames';
import { observer } from 'mobx-react';
import { MouseEvent } from 'react';
import useAutorunRef from '../../hooks/useAutorunRef';
import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import styled from '../styled';
import PlaceCircleLabel from './PlaceCircleLabel';
import PlaceCircleMap from './PlaceCircleMap';
import { DEVICE } from './Visualisation';

interface PlaceCircleProps {
  placeCircle: PlaceCircleModel;
  vis: VisualisationStore;
  className?: string;
  touch: boolean;
  device: DEVICE;
}

const PlaceCircle = observer(({ placeCircle, className, vis, touch, device }: PlaceCircleProps) => {
  const { radius, strokeWidth, active, visible, fade } = placeCircle;

  const ref = useAutorunRef(
    (element: SVGGElement) => {
      const { point } = placeCircle;

      element.setAttribute('transform', `translate(${point.x}, ${point.y})`);
    },
    [placeCircle]
  );

  const toggle = (active?: boolean) => {
    vis.toggle(placeCircle, active);
  };

  return (
    <g
      ref={ref}
      className={classNames(className, { fade })}
      {...(!touch
        ? {
            onMouseEnter: () => toggle(true),
            onMouseLeave: () => toggle(false),
          }
        : {
            onClick: (event: MouseEvent<SVGGElement>) => {
              event.stopPropagation();
              toggle();
            },
          })}
    >
      {visible && (
        <>
          <PlaceCircleBackground r={radius} />
          <PlaceCircleMap placeCircle={placeCircle} vis={vis} />
          <PlaceCircleStroke
            r={radius}
            style={{ strokeWidth: `${strokeWidth}px` }}
            className={classNames({ highlight: active })}
          />
          <PlaceCircleLabel placeCircle={placeCircle} device={device} />
        </>
      )}
    </g>
  );
});

export default styled(PlaceCircle)`
  will-change: transform, opacity;
  pointer-events: auto;
  transition: opacity ${props => props.theme.transitionDuration};
  opacity: 1;

  &.fade {
    opacity: 0.2;
  }

  .leaflet-dragging & {
    cursor: move;
    cursor: grabbing;
  }
`;

const PlaceCircleBackground = styled.circle`
  fill: ${props => props.theme.backgroundColor};
  stroke: none;
`;

const PlaceCircleStroke = styled.circle`
  transition: stroke ${props => props.theme.shortTransitionDuration};
  fill: none;
  stroke: ${props => props.theme.foregroundColor};

  &.highlight {
    stroke: ${props => props.theme.highlightColor};
  }
`;
