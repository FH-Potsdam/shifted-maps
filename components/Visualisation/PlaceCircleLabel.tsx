import classNames from 'classnames';
import { DomUtil } from 'leaflet';
import { autorun, computed, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { Component, createRef, RefObject } from 'react';

import PlaceCircle from '../../stores/PlaceCircle';
import styled, { withTheme } from '../styled';
import { ITheme } from '../theme';

interface IProps {
  placeCircle: PlaceCircle;
  className?: string;
  theme?: ITheme;
}

@observer
class PlaceCircleLabel extends Component<IProps> {
  private readonly ref: RefObject<SVGImageElement>;
  private labelCanvas?: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private drawDisposer?: IReactionDisposer;

  constructor(props: IProps) {
    super(props);

    this.ref = createRef();
  }

  @computed
  get offset() {
    const { strokeWidth, radius } = this.props.placeCircle;

    return strokeWidth * 0.5 + 4 + radius;
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
    const { className, placeCircle } = this.props;
    const { highlight } = placeCircle;

    return (
      <g
        className={classNames(className, { visible: highlight })}
        transform={`translate(0, ${Math.round(this.offset)})`}
      >
        <image ref={this.ref} />
      </g>
    );
  }

  private drawLabel = () => {
    const { theme, placeCircle } = this.props;
    const { children, place, hover } = placeCircle;

    const clusterSize = children.length;
    const label = place.name;

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
    ctx.font = `${labelFontSize * 2}px "Overpass"`;
    const labelMetrics = ctx.measureText(label);
    let width = labelMetrics.width;
    let height =
      labelMetrics.emHeightAscent && labelMetrics.emHeightDescent
        ? labelMetrics.emHeightAscent + labelMetrics.emHeightDescent
        : labelFontSize * 2;

    if (clusterLabel != null) {
      ctx.textAlign = 'center';
      ctx.font = `italic ${clusterLabelFontSize * 2}px "Overpass"`;
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
    ctx.fillStyle = hover ? theme.highlightColor : theme.foregroundColor;
    ctx.strokeStyle = theme.backgroundColor;

    const baseline = labelFontSize * 2;

    ctx.textAlign = 'center';
    ctx.font = `${labelFontSize * 2}px "Overpass"`;
    ctx.strokeText(label, width / 2, baseline);
    ctx.fillText(label, width / 2, baseline);

    if (clusterLabel != null) {
      const baseline = clusterLabelFontSize * 2 + labelFontSize * 2 + spacing / 4;

      ctx.font = `italic ${clusterLabelFontSize * 2}px "Overpass"`;
      ctx.strokeText(clusterLabel, width / 2, baseline);
      ctx.fillText(clusterLabel, width / 2, baseline);
    }

    const image = this.ref.current!;

    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL());
    image.setAttribute('width', String(width * 0.5));
    image.setAttribute('height', String(height * 0.5));
    image.style[DomUtil.TRANSFORM] = `translateX(${Math.round(width * -0.25)}px)`;
  };
}

export default styled(withTheme<IProps>(PlaceCircleLabel))`
  transition: opacity ${props => props.theme.shortTransitionDuration};
  pointer-events: none;
  opacity: 0;

  &.visible {
    opacity: 1;
  }
`;
