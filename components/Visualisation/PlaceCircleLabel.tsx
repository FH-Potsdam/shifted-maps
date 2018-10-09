import { PureComponent, createRef, RefObject } from 'react';
import { DomUtil } from 'leaflet';

type Props = {
  label: string;
  clusterSize: number;
};

class PlaceCircleLabel extends PureComponent<Props> {
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

  private drawLabel() {
    const { label, clusterSize } = this.props;

    if (this.ctx == null || this.labelCanvas == null) {
      return;
    }

    const labelFontSize = 16;
    const clusterLabelFontSize = 12;

    const clusterLabel =
      clusterSize > 0 ? `+${clusterSize} other ${clusterSize === 1 ? 'place' : 'places'}` : null;

    this.ctx.font = `italic ${labelFontSize * 2}px "soleil"`;
    const labelMetrics = this.ctx.measureText(label);
    let width = labelMetrics.width;
    let height = labelFontSize * 2;

    if (clusterLabel != null) {
      this.ctx.font = `italic ${clusterLabelFontSize * 2}px "soleil"`;
      const clusterSizeMetrics = this.ctx.measureText(clusterLabel);

      width = Math.max(width, clusterSizeMetrics.width);
      height += labelFontSize * 2 + 4;
    }

    width = Math.round(width) + 20;
    height = Math.round(height) + 10;

    this.labelCanvas.setAttribute('width', String(width));
    this.labelCanvas.setAttribute('height', String(height));
    this.labelCanvas.style.width = `${Math.round(width * 0.5)}px`;
    this.labelCanvas.style.height = `${Math.round(height * 0.5)}px`;
    this.labelCanvas.style[DomUtil.TRANSFORM] = `translateX(${Math.round(width * -0.25)}px)`;

    this.ctx.textBaseline = 'hanging';
    this.ctx.textAlign = 'center';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 10;
    this.ctx.fillStyle = '#333333';
    this.ctx.strokeStyle = '#FFFFFF';

    this.ctx.font = `italic ${labelFontSize * 2}px "soleil"`;
    this.ctx.strokeText(label, width / 2, 0);
    this.ctx.fillText(label, width / 2, 0);

    if (clusterLabel != null) {
      this.ctx.font = `italic ${clusterLabelFontSize * 2}px "soleil"`;
      this.ctx.strokeText(clusterLabel, width / 2, labelFontSize * 2 + 4);
      this.ctx.fillText(clusterLabel, width / 2, labelFontSize * 2 + 4);
    }
  }

  render() {
    return <canvas ref={this.ref} />;
  }
}

export default PlaceCircleLabel;
