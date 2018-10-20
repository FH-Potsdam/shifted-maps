import { DomUtil } from 'leaflet';
import { createRef, forwardRef, PureComponent, Ref, RefObject } from 'react';

import styled, { withTheme } from '../styled';
import { ITheme } from '../theme';

interface IProps {
  label: string | null;
  hover: boolean;
  theme?: ITheme;
  forwardedRef?: Ref<SVGForeignObjectElement>;
  className?: string;
}

class ConnectionLineLabel extends PureComponent<IProps> {
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
    const { forwardedRef, className } = this.props;

    return (
      <g ref={forwardedRef} className={className}>
        <image ref={this.ref} />
      </g>
    );
  }

  private drawLabel = () => {
    const { label, theme, hover } = this.props;

    if (label == null || theme == null) {
      return;
    }

    const ctx = this.ctx!;
    const canvas = this.labelCanvas!;

    const fontSize = theme.fontSizeSmall;

    ctx.font = `italic ${fontSize * 2}px "soleil"`;
    const metrics = ctx.measureText(label);

    const padding = theme.spacingUnit * 0.5;
    const width = Math.round(metrics.width) + padding * 2;
    const height = Math.round(
      metrics.emHeightAscent && metrics.emHeightDescent
        ? metrics.emHeightAscent + metrics.emHeightDescent
        : fontSize * 2
    );

    canvas.setAttribute('width', String(width));
    canvas.setAttribute('height', String(height));

    ctx.fillStyle = theme.backgroundColor;
    ctx.rect(0, 0, width, height);
    ctx.fill();

    ctx.font = `italic ${fontSize * 2}px "soleil"`;
    ctx.fillStyle = hover ? theme.highlightColor : theme.foregroundColor;

    ctx.fillText(label, padding, fontSize * 2);

    const image = this.ref.current!;

    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL());
    image.setAttribute('width', String(width * 0.5));
    image.setAttribute('height', String(height * 0.5));
    image.style[DomUtil.TRANSFORM] = `translate(${width * -0.25}px, ${height * -0.25}px)`;
  };
}

export default styled(
  withTheme<IProps>(
    forwardRef<SVGForeignObjectElement, IProps>((props, ref) => (
      <ConnectionLineLabel {...props} forwardedRef={ref} />
    ))
  )
)`
  display: ${props => (props.label != null ? 'block' : 'none')};
`;
