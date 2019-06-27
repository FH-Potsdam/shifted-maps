import classNames from 'classnames';
import { DomUtil } from 'leaflet';
import { action, autorun } from 'mobx';
import { disposeOnUnmount, observer } from 'mobx-react';
import { Component } from 'react';

import ConnectionLineLabelModel from '../../stores/ConnectionLineLabel';
import checkFont from '../../utils/checkFont';
import styled, { withTheme } from '../styled';
import { ITheme } from '../theme';
import { DEVICE } from './Visualisation';

interface IProps {
  connectionLineLabel: ConnectionLineLabelModel;
  device: DEVICE;
  theme?: ITheme;
  className?: string;
}

@observer
class ConnectionLineLabel extends Component<IProps> {
  private labelCanvas?: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private ref: SVGGElement | null = null;
  private imageRef: SVGImageElement | null = null;

  componentDidMount() {
    this.labelCanvas = document.createElement('canvas');
    this.ctx = this.labelCanvas.getContext('2d');

    disposeOnUnmount(this, autorun(this.drawLabel));
    disposeOnUnmount(this, autorun(this.styleLabel));

    this.checkFont();
  }

  componentDidUpdate() {
    this.checkFont();
  }

  render() {
    const { className, connectionLineLabel } = this.props;

    return (
      <g
        ref={this.updateRef}
        className={classNames(className, { visible: connectionLineLabel.content != null })}
      >
        <image ref={this.updateImageRef} />
      </g>
    );
  }

  @action
  private updateRef = (ref: SVGGElement | null) => {
    this.ref = ref;
  };

  @action
  private updateImageRef = (ref: SVGImageElement | null) => {
    this.imageRef = ref;
  };

  private drawLabel = () => {
    if (this.imageRef == null) {
      return;
    }

    const { connectionLineLabel, theme, device } = this.props;
    const { highlight, content } = connectionLineLabel;

    if (content == null || theme == null) {
      return;
    }

    const ctx = this.ctx!;
    const canvas = this.labelCanvas!;
    const mobileOrTablet = device === DEVICE.mobile || device === DEVICE.tablet;

    const fontSize = mobileOrTablet ? theme.fontSizeMini : theme.fontSizeSmall;

    ctx.font = `${fontSize * 2}px Overpass`;
    const metrics = ctx.measureText(content);

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

    ctx.font = `${fontSize * 2}px "Overpass"`;
    ctx.fillStyle = highlight ? theme.highlightColor : theme.foregroundColor;

    ctx.fillText(content, padding, fontSize * 2 - 4);

    this.imageRef.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL());
    this.imageRef.setAttribute('width', String(width * 0.5));
    this.imageRef.setAttribute('height', String(height * 0.5));
    this.imageRef.style[DomUtil.TRANSFORM] = `translate(${width * -0.25}px, ${height * -0.25}px)`;
  };

  private styleLabel = () => {
    if (this.ref == null) {
      return;
    }

    const { centerPoint, rotation } = this.props.connectionLineLabel;

    if (centerPoint == null) {
      return;
    }

    this.ref.setAttribute(
      'transform',
      `translate(${centerPoint.x}, ${centerPoint.y}) rotate(${rotation})`
    );
  };

  private checkFont() {
    const { connectionLineLabel, theme } = this.props;

    if (theme == null || connectionLineLabel.content == null) {
      return;
    }

    const font = `${theme.fontSizeSmall * 2}px Overpass`;

    checkFont(font, connectionLineLabel.content, this.drawLabel);
  }
}

export default styled(withTheme(ConnectionLineLabel))`
  will-change: transform;
  display: none;

  &.visible {
    display: block;
  }
`;
