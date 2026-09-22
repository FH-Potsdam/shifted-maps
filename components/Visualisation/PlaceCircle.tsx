import classNames from 'classnames';
import { observer } from 'mobx-react';
import { KeyboardEvent, MouseEvent, useCallback } from 'react';
import styled from 'styled-components';
import useAutorunRef from '../../hooks/useAutorunRef';
import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import { formatDuration } from '../../stores/utils/formatLabel';
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
  const { radius, active, visible, presentationVisible, fade, children } = placeCircle;
  const { place } = placeCircle;
  const descriptionId = `place-${place.id}-description`;

  const ref = useAutorunRef(
    useCallback(
      (element: SVGGElement) => {
        const { point: circlePoint, intersectsViewBounds, presentationRadius, visible } = placeCircle;

        element.style.willChange = intersectsViewBounds ? 'opacity' : 'auto';
        element.setAttribute('transform', `translate(${circlePoint.x}, ${circlePoint.y})`);
        if (visible) {
          element.setAttribute('data-visual-radius', String(presentationRadius));
        } else {
          element.removeAttribute('data-visual-radius');
        }
      },
      [placeCircle]
    )
  );

  const visualRef = useAutorunRef(
    useCallback(
      (element: SVGGElement) => {
        const { radius, presentationRadius, presentationStrokeWidth } = placeCircle;
        const scale = radius === 0 ? 1 : presentationRadius / radius;
        const stroke = element.querySelector<SVGCircleElement>('[data-place-stroke]');

        element.setAttribute('transform', `scale(${scale})`);
        stroke?.setAttribute('stroke-width', String(presentationStrokeWidth / scale));
      },
      [placeCircle]
    )
  );

  const toggle = (active?: boolean) => {
    vis.toggle(placeCircle, active);
  };

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggle();
  };

  return (
    <g
      ref={ref}
      className={classNames(className, { fade, presentation: presentationVisible && !visible })}
      aria-describedby={visible ? descriptionId : undefined}
      aria-hidden={visible ? undefined : true}
      aria-label={visible ? `Place ${place.name}` : undefined}
      aria-pressed={visible ? active : undefined}
      onKeyDown={visible ? handleKeyDown : undefined}
      role={visible ? 'button' : undefined}
      tabIndex={visible ? 0 : undefined}
      {...(visible
        ? !touch
          ? {
              onMouseEnter: () => toggle(true),
              onMouseLeave: () => toggle(false),
            }
          : {
              onClick: (event: MouseEvent<SVGGElement>) => {
                event.stopPropagation();
                toggle();
              },
            }
        : {})}
    >
      {presentationVisible && (
        <>
          {visible && (
            <desc id={descriptionId}>
              Visited {place.visibleFrequency} times with {formatDuration(place.visibleDuration)} total stay.
              {children.length > 0 &&
                ` Contains ${children.length} nearby places: ${children.map((child) => child.place.name).join(', ')}.`}
            </desc>
          )}
          <g ref={visualRef}>
            <PlaceCircleBackground r={radius} />
            <PlaceCircleMap placeCircle={placeCircle} vis={vis} />
            <PlaceCircleStroke data-place-stroke r={radius} className={classNames({ highlight: active })} />
          </g>
          <PlaceCircleLabel placeCircle={placeCircle} device={device} />
        </>
      )}
    </g>
  );
});

export default styled(PlaceCircle)`
  pointer-events: auto;
  transition: opacity ${(props) => props.theme.transitionDuration};
  opacity: 1;

  &.fade {
    opacity: 0.2;
  }

  &.presentation {
    pointer-events: none;
  }

  .leaflet-dragging & {
    cursor: move;
    cursor: grabbing;
  }
`;

const PlaceCircleBackground = styled.circle`
  fill: ${(props) => props.theme.backgroundColor};
  stroke: none;
`;

const PlaceCircleStroke = styled.circle`
  transition: stroke ${(props) => props.theme.shortTransitionDuration};
  fill: none;
  stroke: ${(props) => props.theme.foregroundColor};

  &.highlight {
    stroke: ${(props) => props.theme.highlightColor};
  }
`;
