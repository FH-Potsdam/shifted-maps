import classNames from 'classnames';
import { action, autorun, observable } from 'mobx';
import { disposeOnUnmount, observer } from 'mobx-react';
import { Component, MouseEvent, SyntheticEvent } from 'react';

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

@observer
class ConnectionLine extends Component<IProps> {
  @observable.ref
  private ref: SVGLineElement | null = null;

  componentDidMount() {
    disposeOnUnmount(this, autorun(this.drawLine, { scheduler: requestAnimationFrame }));
  }

  render() {
    const { className, connectionLine, touch, device } = this.props;
    const { highlight, visible, fade, label } = connectionLine;

    if (!visible) {
      return null;
    }

    const toggleListeners = !touch
      ? {
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
        }
      : {
          onClick: this.handleClick,
        };

    return (
      <g className={classNames(className, { fade })} {...toggleListeners}>
        <ConnectionLineLine ref={this.updateRef} className={classNames({ highlight })} />
        <ConnectionLineLabel connectionLineLabel={label} device={device} />
      </g>
    );
  }

  @action
  private updateRef = (ref: SVGLineElement | null) => {
    this.ref = ref;
  };

  private drawLine = () => {
    if (this.ref == null) {
      return;
    }

    const { fromPlaceCircleEdge, toPlaceCircleEdge } = this.props.connectionLine;

    if (fromPlaceCircleEdge == null || toPlaceCircleEdge == null) {
      return;
    }

    const { strokeWidth } = this.props.connectionLine;

    this.ref.setAttribute('stroke-width', String(strokeWidth));
    this.ref.setAttribute('x1', String(fromPlaceCircleEdge.x));
    this.ref.setAttribute('y1', String(fromPlaceCircleEdge.y));
    this.ref.setAttribute('x2', String(toPlaceCircleEdge.x));
    this.ref.setAttribute('y2', String(toPlaceCircleEdge.y));
  };

  private handleMouseEnter = (event: SyntheticEvent) => {
    event.stopPropagation();

    this.toggle(true);
  };

  private handleMouseLeave = (event: SyntheticEvent) => {
    event.stopPropagation();

    this.toggle(false);
  };

  private handleClick = (event: MouseEvent<SVGGElement>) => {
    event.stopPropagation();

    this.toggle();
  };

  private toggle(active?: boolean) {
    const { connectionLine, vis } = this.props;

    vis.toggle(connectionLine, active);
  }
}

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
