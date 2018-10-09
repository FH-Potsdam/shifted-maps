import { PureComponent, createRef, RefObject } from 'react';
import { DomUtil } from 'leaflet';

type Props = {
  label: string | null;
};

class ConnectionLineLabel extends PureComponent<Props> {
  ref: RefObject<HTMLCanvasElement>;
  labelCanvas?: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null = null;

  constructor(props: Props) {
    super(props);

    this.ref = createRef();
  }

  componentDidMount() {
    this.labelCanvas = this.ref.current!;
    this.ctx = this.labelCanvas.getContext('2d');

    this.drawLabel();
  }

  componentDidUpdate() {
    this.drawLabel();
  }

  private drawLabel = () => {
    const { label } = this.props;

    if (label == null || this.ctx == null || this.labelCanvas == null) {
      return;
    }

    const fontSize = 12;

    this.ctx.font = `italic ${fontSize * 2}px "soleil"`;
    const metrics = this.ctx.measureText(label);

    const padding = 16;
    const width = Math.round(metrics.width) + padding * 2;
    const height = fontSize * 2;

    this.labelCanvas.setAttribute('width', String(width));
    this.labelCanvas.setAttribute('height', String(height));
    this.labelCanvas.style.width = `${Math.round(width * 0.5)}px`;
    this.labelCanvas.style.height = `${Math.round(height * 0.5)}px`;
    this.labelCanvas.style[DomUtil.TRANSFORM] = `translate(${Math.round(
      width * -0.25
    )}px, ${Math.round(height * -0.5)}px)`;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.rect(0, 0, width, height);
    this.ctx.fill();

    this.ctx.textBaseline = 'hanging';
    this.ctx.font = `italic ${fontSize * 2}px "soleil"`;
    this.ctx.fillStyle = '#333333';

    this.ctx.fillText(label, padding, 0);
  };

  render() {
    return <canvas ref={this.ref} />;
  }
}

export default ConnectionLineLabel;
