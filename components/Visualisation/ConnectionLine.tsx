import classNames from 'classnames';
import { action, autorun, observable, IAutorunOptions } from 'mobx';
import { disposeOnUnmount, observer, useLocalStore } from 'mobx-react';
import { Component, MouseEvent, SyntheticEvent, useEffect, useCallback, useRef } from 'react';

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

function useAutorun(
  callback: () => void,
  dependencies?: readonly any[],
  options?: IAutorunOptions
) {
  return useEffect(() => autorun(callback, options), dependencies);
}

function useElementRef<T>(callback: (ref: T) => void, dependencies?: readonly any[]) {
  const ref = useRef<T | null>(null);

  useAutorun(() => {
    if (ref.current == null) {
      return;
    }

    callback(ref.current);
  }, [ref.current, ...dependencies!]);

  return ref;
}

export const ConnectionLine = observer((props: IProps) => {
  const { className, connectionLine, touch, device } = props;
  const { highlight, visible, fade, label, vis } = connectionLine;

  if (!visible) {
    return null;
  }

  const ref = useElementRef(
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
