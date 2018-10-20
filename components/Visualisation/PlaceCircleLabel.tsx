import { DomUtil } from 'leaflet';
import { createRef, PureComponent, RefObject } from 'react';

import styled, { withTheme } from '../styled';
import { ITheme } from '../theme';

interface IProps {
  label: string;
  clusterSize: number;
  className?: string;
  offset: number;
  hover: boolean;
  theme?: ITheme;
}

class PlaceCircleLabel extends PureComponent<IProps> {
  ref: RefObject<SVGImageElement>;
  labelCanvas?: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null = null;

  constructor(props: IProps) {
    super(props);

    this.ref = createRef();
  }

  componentDidMount() {
    this.labelCanvas = document.createElement('canvas');
    this.ctx = this.labelCanvas.getContext('2d');

    this.drawLabel();
  }

  componentDidUpdate() {
    this.drawLabel();
  }

  render() {
    const { className } = this.props;

    return (
      <g className={className}>
        <image ref={this.ref} />
      </g>
    );
  }

  private drawLabel() {
    const { label, clusterSize, theme } = this.props;

    if (theme == null) {
      throw new Error('Missing theme.');
    }

    const ctx = this.ctx!;
    const canvas = this.labelCanvas!;

    const labelFontSize = theme.fontSize;
    const clusterLabelFontSize = theme.fontSizeSmall;
    const spacing = theme.spacingUnit;

    const clusterLabel =
      clusterSize > 0 ? `+${clusterSize} other ${clusterSize === 1 ? 'place' : 'places'}` : null;

    ctx.textAlign = 'center';
    ctx.font = `italic ${labelFontSize * 2}px "soleil"`;
    const labelMetrics = ctx.measureText(label);
    let width = labelMetrics.width;
    let height =
      labelMetrics.emHeightAscent && labelMetrics.emHeightDescent
        ? labelMetrics.emHeightAscent + labelMetrics.emHeightDescent
        : labelFontSize * 2;

    if (clusterLabel != null) {
      ctx.textAlign = 'center';
      ctx.font = `italic ${clusterLabelFontSize * 2}px "soleil"`;
      const clusterSizeMetrics = ctx.measureText(clusterLabel);

      width = Math.max(width, clusterSizeMetrics.width);
      height +=
        (clusterSizeMetrics.emHeightAscent && clusterSizeMetrics.emHeightDescent
          ? clusterSizeMetrics.emHeightAscent + clusterSizeMetrics.emHeightDescent
          : clusterLabelFontSize * 2) +
        spacing * 0.25;
    }

    width = Math.round(width) + spacing;
    height = Math.round(height) + spacing / 2;

    canvas.setAttribute('width', String(width));
    canvas.setAttribute('height', String(height));

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = spacing / 2;
    ctx.fillStyle = theme.highlightColor;
    ctx.strokeStyle = theme.backgroundColor;

    const baseline = labelFontSize * 2;

    ctx.textAlign = 'center';
    ctx.font = `italic ${labelFontSize * 2}px "soleil"`;
    ctx.strokeText(label, width / 2, baseline);
    ctx.fillText(label, width / 2, baseline);

    if (clusterLabel != null) {
      const baseline = clusterLabelFontSize * 2 + labelFontSize * 2 + spacing / 4;

      ctx.font = `italic ${clusterLabelFontSize * 2}px "soleil"`;
      ctx.strokeText(clusterLabel, width / 2, baseline);
      ctx.fillText(clusterLabel, width / 2, baseline);
    }

    const image = this.ref.current!;

    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL());
    image.setAttribute('width', String(width * 0.5));
    image.setAttribute('height', String(height * 0.5));
    image.style[DomUtil.TRANSFORM] = `translateX(${Math.round(width * -0.25)}px)`;
  }
}

export default styled(withTheme<IProps>(PlaceCircleLabel))`
  transition: opacity ${props => props.theme.shortTransitionDuration};
  pointer-events: none;
  opacity: ${props => (props.hover ? 1 : 0)};
  transform: translate(0, ${props => Math.round(props.offset)}px);
`;
