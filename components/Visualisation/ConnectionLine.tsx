import classNames from 'classnames';
import debounce from 'lodash/fp/debounce';
import { action, autorun, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { Component, createRef, RefObject, SyntheticEvent } from 'react';

import ConnectionLineModel from '../../stores/ConnectionLine';
import styled from '../styled';
import ConnectionLineLabel from './ConnectionLineLabel';

interface IProps {
  connectionLine: ConnectionLineModel;
  className?: string;
}

@observer
class ConnectionLine extends Component<IProps> {
  private readonly lineRef: RefObject<SVGLineElement>;
  private readonly labelRef: RefObject<SVGForeignObjectElement>;
  private styleDisposer?: IReactionDisposer;

  private toggle = debounce(50)(
    action((hover: boolean) => {
      this.props.connectionLine.hover = hover;
    })
  );

  constructor(props: IProps) {
    super(props);

    this.lineRef = createRef();
    this.labelRef = createRef();
  }

  componentDidMount() {
    this.styleDisposer = autorun(this.style);
  }

  componentWillUnmount() {
    if (this.styleDisposer != null) {
      this.styleDisposer();
    }
  }

  render() {
    const { className, connectionLine } = this.props;
    const { label, highlight, visible, fade } = connectionLine;

    return (
      <g
        className={classNames(className, { visible, fade })}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <ConnectionLineLine innerRef={this.lineRef} className={classNames({ highlight })} />
        <ConnectionLineLabel innerRef={this.labelRef} label={label} highlight={highlight} />
      </g>
    );
  }

  private style = () => {
    const { from, to, strokeWidth } = this.props.connectionLine;

    const line = this.lineRef.current!;
    const label = this.labelRef.current!;
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

    line.setAttribute('stroke-width', String(strokeWidth));
    line.setAttribute('x1', String(fromPart.x));
    line.setAttribute('y1', String(fromPart.y));
    line.setAttribute('x2', String(toPart.x));
    line.setAttribute('y2', String(toPart.y));

    const center = fromPart.add(vectorPart.divideBy(2));
    let rotate = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;

    if (rotate > 90) {
      rotate -= 180;
    } else if (rotate < -90) {
      rotate += 180;
    }

    label.setAttribute('transform', `translate(${center.x}, ${center.y}) rotate(${rotate})`);
  };

  private handleMouseEnter = (event: SyntheticEvent) => {
    event.stopPropagation();

    this.toggle(true);
  };

  private handleMouseLeave = (event: SyntheticEvent) => {
    event.stopPropagation();

    this.toggle(false);
  };
}

export default styled(ConnectionLine)`
  pointer-events: auto;
  will-change: opacity;
  transition: opacity ${props => props.theme.transitionDuration};
  display: none;
  opacity: 1;

  &.visible {
    display: block;
  }

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
