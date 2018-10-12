import { DomUtil } from 'leaflet';
import { createRef, PureComponent, RefObject } from 'react';

import styled, { withTheme } from '../styled';
import { Theme } from '../theme';

interface IProps {
  label: string;
  clusterSize: number;
  className?: string;
  offset: number;
  hover: boolean;
  theme?: Theme;
}

class PlaceCircleLabel extends PureComponent<IProps> {
  ref: RefObject<HTMLCanvasElement>;
  labelCanvas?: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null = null;

  constructor(props: IProps) {
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

  render() {
    const { className, offset } = this.props;

    return (
      <foreignObject className={className} transform={`translate(0, ${Math.round(offset)})`}>
        <canvas ref={this.ref} />
      </foreignObject>
    );
  }

  private drawLabel() {
    const { label, clusterSize, theme } = this.props;

    if (this.ctx == null || this.labelCanvas == null || theme == null) {
      return;
    }

    const labelFontSize = theme.fontSize;
    const clusterLabelFontSize = theme.fontSizeSmall;
    const spacing = theme.spacingUnit;

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
      height += labelFontSize * 2 + spacing / 4;
    }

    width = Math.round(width) + spacing;
    height = Math.round(height) + spacing / 2;

    this.labelCanvas.setAttribute('width', String(width));
    this.labelCanvas.setAttribute('height', String(height));
    this.labelCanvas.style.width = `${Math.round(width * 0.5)}px`;
    this.labelCanvas.style.height = `${Math.round(height * 0.5)}px`;
    this.labelCanvas.style[DomUtil.TRANSFORM] = `translateX(${Math.round(width * -0.25)}px)`;

    this.ctx.textBaseline = 'hanging';
    this.ctx.textAlign = 'center';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = spacing / 2;
    this.ctx.fillStyle = theme.highlightColor;
    this.ctx.strokeStyle = theme.backgroundColor;

    this.ctx.font = `italic ${labelFontSize * 2}px "soleil"`;
    this.ctx.strokeText(label, width / 2, 0);
    this.ctx.fillText(label, width / 2, 0);

    if (clusterLabel != null) {
      this.ctx.font = `italic ${clusterLabelFontSize * 2}px "soleil"`;
      this.ctx.strokeText(clusterLabel, width / 2, labelFontSize * 2 + spacing / 4);
      this.ctx.fillText(clusterLabel, width / 2, labelFontSize * 2 + spacing / 4);
    }
  }
}

export default styled(withTheme<IProps>(PlaceCircleLabel))`
  transition: opacity ${props => props.theme.shortTransitionDuration};
  pointer-events: none;
  opacity: ${props => (props.hover ? 1 : 0)};
`;
