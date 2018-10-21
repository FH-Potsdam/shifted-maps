import classNames from 'classnames';
import { DomUtil } from 'leaflet';
import { autorun, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { Component, createRef, forwardRef, Ref, RefObject } from 'react';

import ConnectionLine from '../../stores/ConnectionLine';
import styled, { withTheme } from '../styled';
import { ITheme } from '../theme';

interface IProps {
  connectionLine: ConnectionLine;
  theme?: ITheme;
  forwardedRef?: Ref<SVGForeignObjectElement>;
  className?: string;
}

@observer
class ConnectionLineLabel extends Component<IProps> {
  private labelCanvas?: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private readonly ref: RefObject<SVGImageElement>;
  private drawDisposer?: IReactionDisposer;

  constructor(props: IProps) {
    super(props);

    this.ref = createRef();
  }

  componentDidMount() {
    this.labelCanvas = document.createElement('canvas');
    this.ctx = this.labelCanvas.getContext('2d');

    this.drawDisposer = autorun(this.drawLabel);
  }

  componentWillUnmount() {
    if (this.drawDisposer != null) {
      this.drawDisposer();
    }
  }

  render() {
    const { forwardedRef, className, connectionLine } = this.props;
    const { label } = connectionLine;

    return (
      <g ref={forwardedRef} className={classNames(className, { visible: label != null })}>
        <image ref={this.ref} />
      </g>
    );
  }

  private drawLabel = () => {
    const { connectionLine, theme } = this.props;
    const { label, highlight } = connectionLine;

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
    ctx.fillStyle = highlight ? theme.highlightColor : theme.foregroundColor;

    ctx.fillText(label, padding, fontSize * 2 - 4);

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
  will-change: transform;
  display: none;

  &.visible {
    display: block;
  }
`;
