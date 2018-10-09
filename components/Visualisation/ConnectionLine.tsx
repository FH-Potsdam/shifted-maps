import { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { ValueReaction, value } from 'popmotion';
import styler, { Styler } from 'stylefire';
import { autorun, IReactionDisposer } from 'mobx';
import { HotSubscription } from 'popmotion/lib/reactions/types';

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
  private lineValue: ValueReaction;
  private labelValue: ValueReaction;
  private lineStyler?: Styler;
  private labelStyler?: Styler;
  private lineValueSubscribtion?: HotSubscription;
  private labelValueSubscribtion?: HotSubscription;
  private styleSubscription?: IReactionDisposer;

  constructor(props: Props) {
    super(props);

    this.lineRef = createRef();
    this.labelRef = createRef();

    this.lineValue = value({ x1: 0, y1: 0, x2: 0, y2: 0, strokeWidth: 0 });
    this.labelValue = value({ x: 0, y: 0, rotate: 0 });
  }

  componentDidMount() {
    this.runStylers();
  }

  componentDidUpdate() {
    this.runStylers();
  }

  componentWillUnmount() {
    if (this.styleSubscription != null) {
      this.styleSubscription();
    }

    if (this.lineValueSubscribtion != null) {
      this.lineValueSubscribtion.unsubscribe();
    }

    if (this.labelValueSubscribtion != null) {
      this.labelValueSubscribtion.unsubscribe();
    }
  }

  private runStylers() {
    if (this.lineValueSubscribtion != null) {
      this.lineValueSubscribtion.unsubscribe();
    }

    if (this.labelValueSubscribtion != null) {
      this.labelValueSubscribtion.unsubscribe();
    }

    if (this.styleSubscription != null) {
      this.styleSubscription();
    }

    this.lineStyler = styler(this.lineRef.current!, {});
    this.lineValueSubscribtion = this.lineValue.subscribe(this.lineStyler.set);

    this.labelStyler = styler(this.labelRef.current!, {});
    this.labelValueSubscribtion = this.labelValue.subscribe(this.labelStyler.set);

    this.styleSubscription = autorun(this.style);
  }

  private style = () => {
    const { from, to, strokeWidth } = this.props.connectionLine;

    this.lineValue.update({
      x1: from.point.x,
      y1: from.point.y,
      x2: to.point.x,
      y2: to.point.y,
      strokeWidth,
    });

    const vector = to.point.subtract(from.point);
    const center = from.point.add(vector.divideBy(2));
    let rotate = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;

    if (rotate > 90) {
      rotate -= 180;
    } else if (rotate < -90) {
      rotate += 180;
    }

    this.labelValue.update({
      x: center.x,
      y: center.y,
      rotate: rotate,
    });

    this.lineStyler!.render();
    this.labelStyler!.render();
  };

  render() {
    const { className, connectionLine } = this.props;
    const { label } = connectionLine;

    return (
      <g className={className}>
        <ConnectionLineLine innerRef={this.lineRef} />
        <foreignObject ref={this.labelRef}>
          <ConnectionLineLabel label={label} />
        </foreignObject>
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
