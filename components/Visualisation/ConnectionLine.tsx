import classNames from 'classnames';
import { observer } from 'mobx-react';
import { KeyboardEvent, SyntheticEvent, useCallback } from 'react';
import styled from 'styled-components';
import useAutorunRef from '../../hooks/useAutorunRef';
import ConnectionLineModel from '../../stores/ConnectionLine';
import VisualisationStore from '../../stores/VisualisationStore';
import { formatDistance, formatDuration } from '../../stores/utils/formatLabel';
import ConnectionLineLabel from './ConnectionLineLabel';
import { DEVICE } from './Visualisation';

interface ConnectionLineProps {
  connectionLine: ConnectionLineModel;
  vis: VisualisationStore;
  touch: boolean;
  className?: string;
  device: DEVICE;
}

export const ConnectionLine = observer((props: ConnectionLineProps) => {
  const { className, connectionLine, touch, device } = props;
  const { active, highlight, visible, presentation, fade, label, vis } = connectionLine;
  const descriptionId = `connection-${connectionLine.key}-description`;
  const tripLabel = connectionLine.visibleFrequency === 1 ? 'trip' : 'trips';

  const ref = useAutorunRef(
    useCallback(
      (ref: SVGLineElement) => {
        const { clippedPoints } = connectionLine;

        if (clippedPoints == null) {
          ref.style.display = 'none';
          return;
        }

        const [fromPoint, toPoint] = clippedPoints;

        ref.style.removeProperty('display');

        const { strokeWidth } = connectionLine;

        ref.setAttribute('stroke-width', String(strokeWidth));
        ref.setAttribute('x1', String(fromPoint.x));
        ref.setAttribute('y1', String(fromPoint.y));
        ref.setAttribute('x2', String(toPoint.x));
        ref.setAttribute('y2', String(toPoint.y));
      },
      [connectionLine]
    )
  );

  const groupRef = useAutorunRef(
    useCallback(
      (element: SVGGElement) => {
        if (connectionLine.presentation) {
          element.style.opacity = String(vis.transitionConnectionOpacity);
        } else {
          element.style.removeProperty('opacity');
        }
      },
      [connectionLine, vis]
    )
  );

  const handleMouseEnter = (event: SyntheticEvent) => {
    event.stopPropagation();

    vis.toggle(connectionLine, true);
  };

  const handleMouseLeave = (event: SyntheticEvent) => {
    event.stopPropagation();

    vis.toggle(connectionLine, false);
  };

  const handleClick = (event: SyntheticEvent) => {
    event.stopPropagation();

    vis.toggle(connectionLine);
  };

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    vis.toggle(connectionLine);
  };

  const toggleListeners = !touch
    ? {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      }
    : {
        onClick: handleClick,
      };

  if (!visible && !presentation) {
    return null;
  }

  return (
    <g
      ref={groupRef}
      aria-describedby={presentation ? undefined : descriptionId}
      aria-hidden={presentation ? true : undefined}
      aria-label={
        presentation
          ? undefined
          : `Connection between ${connectionLine.from.place.name} and ${connectionLine.to.place.name}`
      }
      aria-pressed={presentation ? undefined : active}
      className={classNames(className, { fade, presentation })}
      data-visual-stroke-width={presentation ? undefined : connectionLine.strokeWidth}
      onKeyDown={presentation ? undefined : handleKeyDown}
      role={presentation ? undefined : 'button'}
      tabIndex={presentation ? undefined : 0}
      {...(presentation ? {} : toggleListeners)}
    >
      <desc id={descriptionId}>
        {connectionLine.visibleFrequency} {tripLabel} with {formatDistance(connectionLine.visibleDistance)} average
        distance and {formatDuration(connectionLine.visibleDuration)} average travel time.
      </desc>
      <ConnectionLineLine ref={ref} className={classNames({ highlight })} />
      <ConnectionLineLabel connectionLineLabel={label} device={device} />
    </g>
  );
});

export default styled(ConnectionLine)`
  pointer-events: auto;
  transition: opacity ${(props) => props.theme.transitionDuration};
  opacity: 1;

  &.fade {
    opacity: 0.2;
  }

  &.presentation {
    pointer-events: none;
    transition: none;
  }
`;

const ConnectionLineLine = styled.line`
  stroke: ${(props) => props.theme.foregroundColor};

  &.highlight {
    stroke: ${(props) => props.theme.highlightColor};
  }
`;
