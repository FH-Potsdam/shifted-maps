import classNames from 'classnames';
import { observer } from 'mobx-react';
import { SyntheticEvent, useCallback } from 'react';

import useAutorunRef from '../../hooks/useAutorunRef';
import ConnectionLineModel from '../../stores/ConnectionLine';
import VisualisationStore from '../../stores/VisualisationStore';
import styled from '../styled';
import ConnectionLineLabel from './ConnectionLineLabel';
import { DEVICE } from './Visualisation';

interface IProps {
  connectionLine: ConnectionLineModel;
  vis: VisualisationStore;
  touch: boolean;
  className?: string;
  device: DEVICE;
}

export const ConnectionLine = observer((props: IProps) => {
  const { className, connectionLine, touch, device } = props;
  const { highlight, visible, fade, label, vis } = connectionLine;

  const ref = useAutorunRef(
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
  );

  const handleMouseEnter = useCallback(
    (event: SyntheticEvent) => {
      event.stopPropagation();

      vis.toggle(connectionLine, true);
    },
    [connectionLine, vis]
  );

  const handleMouseLeave = useCallback(
    (event: SyntheticEvent) => {
      event.stopPropagation();

      vis.toggle(connectionLine, false);
    },
    [connectionLine, vis]
  );

  const handleClick = useCallback(
    (event: SyntheticEvent) => {
      event.stopPropagation();

      vis.toggle(connectionLine);
    },
    [connectionLine, vis]
  );

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
    <g className={classNames(className, { fade })} {...toggleListeners}>
      <ConnectionLineLine ref={ref} className={classNames({ highlight })} />
      <ConnectionLineLabel connectionLineLabel={label} device={device} />
    </g>
  );
});

export default styled(ConnectionLine)`
  pointer-events: auto;
  will-change: opacity;
  transition: opacity ${props => props.theme.transitionDuration};
  opacity: 1;

  &.fade {
    opacity: 0.2;
  }
`;

const ConnectionLineLine = styled.line`
  stroke: ${props => props.theme.foregroundColor};

  &.highlight {
    stroke: ${props => props.theme.highlightColor};
  }
`;
