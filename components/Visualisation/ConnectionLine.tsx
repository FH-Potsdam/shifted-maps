import { autorun, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { Component, createRef, RefObject } from 'react';

import ConnectionLineModel from '../../stores/ConnectionLine';
import styled from '../styled';
import ConnectionLineLabel from './ConnectionLineLabel';

interface IProps {
  connectionLine: ConnectionLineModel;
  className?: string;
}

@observer
class ConnectionLine extends Component<IProps> {
  private lineRef: RefObject<SVGLineElement>;
  private labelRef: RefObject<SVGForeignObjectElement>;
  private styleDisposer?: IReactionDisposer;

  constructor(props: IProps) {
    super(props);

    this.lineRef = createRef();
    this.labelRef = createRef();
  }

  public componentDidMount() {
    this.styleDisposer = autorun(this.style);
  }

  public componentWillUnmount() {
    if (this.styleDisposer != null) {
      this.styleDisposer();
    }
  }

  public render() {
    const { className, connectionLine } = this.props;
    const { label } = connectionLine;

    return (
      <g className={className}>
        <ConnectionLineLine innerRef={this.lineRef} />
        <ConnectionLineLabel innerRef={this.labelRef} label={label} />
      </g>
    );
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

    if (distance === 0) {
      return;
    }

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
}

const ConnectionLineLine = styled.line`
  stroke: ${props => props.theme.foregroundColor};
`;

export default styled(ConnectionLine)`
  pointer-events: auto;
`;
