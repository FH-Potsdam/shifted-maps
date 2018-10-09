import { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { ValueReaction, value } from 'popmotion';
import styler, { Styler } from 'stylefire';
import { autorun, IReactionDisposer } from 'mobx';
import { HotSubscription } from 'popmotion/lib/reactions/types';

import ConnectionLineModel from '../../store/ConnectionLine';
import styled from '../styled';
import { DomUtil } from 'leaflet';

type Props = {
  connectionLine: ConnectionLineModel;
  className?: string;
};

@observer
class ConnectionLine extends Component<Props> {
  private lineRef: RefObject<SVGLineElement>;
  private labelRef: RefObject<SVGForeignObjectElement>;
  private labelCanvasRef: RefObject<HTMLCanvasElement>;
  private lineValue: ValueReaction;
  private labelValue: ValueReaction;
  private lineStyler?: Styler;
  private labelStyler?: Styler;
  private lineValueSubscribtion?: HotSubscription;
  private labelValueSubscribtion?: HotSubscription;
  private styleSubscription?: IReactionDisposer;
  private drawLabelSubscribtion?: IReactionDisposer;

  constructor(props: Props) {
    super(props);

    this.lineRef = createRef();
    this.labelRef = createRef();
    this.labelCanvasRef = createRef();

    this.lineValue = value({ x1: 0, y1: 0, x2: 0, y2: 0, strokeWidth: 0 });
    this.labelValue = value({ x: 0, y: 0, rotate: 0 });
  }

  componentDidMount() {
    this.runStylers();

    this.drawLabelSubscribtion = autorun(this.drawLabel);
  }

  componentDidUpdate() {
    this.runStylers();
  }

  componentWillUnmount() {
    if (this.styleSubscription != null) {
      this.styleSubscription();
    }

    if (this.drawLabelSubscribtion != null) {
      this.drawLabelSubscribtion();
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

  private drawLabel = () => {
    const { label } = this.props.connectionLine;

    if (label == null) {
      return;
    }

    const labelCanvas = this.labelCanvasRef.current!;
    const context = labelCanvas.getContext('2d')!;

    context.font = 'italic 24px "soleil"';
    const metrics = context.measureText(label);

    const padding = 16;
    const width = Math.round(metrics.width) + padding * 2;
    const height = 24;

    labelCanvas.setAttribute('width', String(width));
    labelCanvas.setAttribute('height', String(height));
    labelCanvas.style.width = `${width * 0.5}px`;
    labelCanvas.style.height = `${height * 0.5}px`;
    labelCanvas.style[DomUtil.TRANSFORM] = `translate(${width * -0.25}px, ${height * -0.5}px)`;

    context.fillStyle = '#ffffff';
    context.rect(0, 0, width, height);
    context.fill();

    context.textBaseline = 'hanging';
    context.font = 'italic 24px "soleil"';
    context.fillStyle = '#333333';

    context.fillText(label, padding, 0);
  };

  render() {
    const { className } = this.props;

    return (
      <g className={className}>
        <ConnectionLineLine innerRef={this.lineRef} />
        <foreignObject ref={this.labelRef}>
          <canvas ref={this.labelCanvasRef} />
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
