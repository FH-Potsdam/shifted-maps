import { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { autorun, IReactionDisposer } from 'mobx';

import ConnectionLineModel from '../../store/ConnectionLine';
import styled from '../styled';
import ConnectionLineLabel from './ConnectionLineLabel';

type Props = {
  connectionLine: ConnectionLineModel;
  className?: string;
};

@observer
class ConnectionLine extends Component<Props> {
  private lineRef: RefObject<SVGLineElement>;
  private labelRef: RefObject<SVGForeignObjectElement>;
  private styleSubscription?: IReactionDisposer;

  constructor(props: Props) {
    super(props);

    this.lineRef = createRef();
    this.labelRef = createRef();
  }

  componentDidMount() {
    this.styleSubscription = autorun(this.style);
  }

  componentWillUnmount() {
    if (this.styleSubscription != null) {
      this.styleSubscription();
    }
  }

  private style = () => {
    const { from, to, strokeWidth } = this.props.connectionLine;

    const line = this.lineRef.current!;
    const label = this.labelRef.current!;

    line.setAttribute('stroke-width', String(strokeWidth));
    line.setAttribute('x1', String(from.point.x));
    line.setAttribute('y1', String(from.point.y));
    line.setAttribute('x2', String(to.point.x));
    line.setAttribute('y2', String(to.point.y));

    const vector = to.point.subtract(from.point);
    const distance = to.point.distanceTo(from.point);
    const fromPart = from.point.add(vector.multiplyBy(from.radius / distance));
    const toPart = to.point.subtract(vector.multiplyBy(to.radius / distance));
    const vectorPart = toPart.subtract(fromPart);

    const center = fromPart.add(vectorPart.divideBy(2));
    let rotate = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;

    if (rotate > 90) {
      rotate -= 180;
    } else if (rotate < -90) {
      rotate += 180;
    }

    label.setAttribute('transform', `translate(${center.x}, ${center.y}) rotate(${rotate})`);
  };

  render() {
    const { className, connectionLine } = this.props;
    const { label } = connectionLine;

    return (
      <g className={className}>
        <ConnectionLineLine innerRef={this.lineRef} />
        <ConnectionLineLabel innerRef={this.labelRef} label={label} />
      </g>
    );
  }
}

const ConnectionLineLine = styled.line`
  stroke: ${props => props.theme.foregroundColor};
`;

export default styled(ConnectionLine)`
  pointer-events: auto;
`;
