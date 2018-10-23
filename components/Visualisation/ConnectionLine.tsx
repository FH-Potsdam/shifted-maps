import classNames from 'classnames';
import debounce from 'lodash/fp/debounce';
import { action, autorun, IReactionDisposer, observable } from 'mobx';
import { observer } from 'mobx-react';
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
  private styleDisposer?: IReactionDisposer;

  @observable.ref
  private lineRef: SVGLineElement | null = null;

  @observable.ref
  private labelRef: SVGGElement | null = null;

  private toggle = debounce(50)((active?: boolean) => {
    const { connectionLine, vis } = this.props;

    vis.toggle(connectionLine, active);
  });

  componentDidMount() {
    this.styleDisposer = autorun(this.style);
  }

  componentWillUnmount() {
    if (this.styleDisposer != null) {
      this.styleDisposer();
    }
  }

  render() {
    const { className, connectionLine, touch, device } = this.props;
    const { highlight, visible, fade } = connectionLine;

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
        <ConnectionLineLine innerRef={this.updateLineRef} className={classNames({ highlight })} />
        <ConnectionLineLabel
          innerRef={this.updateLabelRef}
          connectionLine={connectionLine}
          device={device}
        />
      </g>
    );
  }

  @action
  private updateLineRef = (ref: SVGLineElement | null) => {
    this.lineRef = ref;
  };

  @action
  private updateLabelRef = (ref: SVGGElement | null) => {
    this.labelRef = ref;
  };

  private style = () => {
    if (this.lineRef == null || this.labelRef == null) {
      return;
    }

    const { from, to, strokeWidth } = this.props.connectionLine;

    const vector = to.point.subtract(from.point);
    const distance = to.point.distanceTo(from.point);

    if (distance === 0) {
      return;
    }

    const fromPart = from.point.add(
      vector.multiplyBy((from.radius + from.strokeWidth / 2 - 0.5) / distance)
    );
    const toPart = to.point.subtract(
      vector.multiplyBy((to.radius + to.strokeWidth / 2 - 0.5) / distance)
    );
    const vectorPart = toPart.subtract(fromPart);

    this.lineRef.setAttribute('stroke-width', String(strokeWidth));
    this.lineRef.setAttribute('x1', String(fromPart.x));
    this.lineRef.setAttribute('y1', String(fromPart.y));
    this.lineRef.setAttribute('x2', String(toPart.x));
    this.lineRef.setAttribute('y2', String(toPart.y));

    const center = fromPart.add(vectorPart.divideBy(2));
    let rotate = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;

    if (rotate > 90) {
      rotate -= 180;
    } else if (rotate < -90) {
      rotate += 180;
    }

    this.labelRef.setAttribute(
      'transform',
      `translate(${center.x}, ${center.y}) rotate(${rotate})`
    );
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
