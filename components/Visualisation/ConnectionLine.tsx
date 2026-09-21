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
  const { active, highlight, visible, fade, label, vis } = connectionLine;
  const descriptionId = `connection-${connectionLine.key}-description`;
  const tripLabel = connectionLine.visibleFrequency === 1 ? 'trip' : 'trips';

  const ref = useAutorunRef(
    useCallback(
      (ref: SVGLineElement) => {
        const { fromPlaceCircleEdge, toPlaceCircleEdge } = connectionLine;

        if (fromPlaceCircleEdge == null || toPlaceCircleEdge == null) {
          return;
        }

        const { strokeWidth } = connectionLine;

        ref.setAttribute('stroke-width', String(strokeWidth));
        ref.setAttribute('x1', String(fromPlaceCircleEdge.x));
        ref.setAttribute('y1', String(fromPlaceCircleEdge.y));
        ref.setAttribute('x2', String(toPlaceCircleEdge.x));
        ref.setAttribute('y2', String(toPlaceCircleEdge.y));
      },
      [connectionLine]
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

  if (!visible) {
    return null;
  }

  return (
    <g
      aria-describedby={descriptionId}
      aria-label={`Connection between ${connectionLine.from.place.name} and ${connectionLine.to.place.name}`}
      aria-pressed={active}
      className={classNames(className, { fade })}
      data-visual-stroke-width={connectionLine.strokeWidth}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      {...toggleListeners}
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
  will-change: opacity;
  transition: opacity ${(props) => props.theme.transitionDuration};
  opacity: 1;

  &.fade {
    opacity: 0.2;
  }
`;

const ConnectionLineLine = styled.line`
  stroke: ${(props) => props.theme.foregroundColor};

  &.highlight {
    stroke: ${(props) => props.theme.highlightColor};
  }
`;
