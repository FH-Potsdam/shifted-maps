import classNames from 'classnames';
import { DomUtil } from 'leaflet';
import { observer } from 'mobx-react';
import { useEffect, useRef } from 'react';

import useAutorunRef from '../../hooks/useAutorunRef';
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

const ConnectionLineLabel = observer((props: IProps) => {
  const { className, connectionLineLabel, theme, device } = props;
  const labelCanvesRef = useRef<HTMLCanvasElement>();
  const labelCtxRef = useRef<CanvasRenderingContext2D>();
  const fontLoaded = useRef<boolean>(false);

  useEffect(() => {
    labelCanvesRef.current = document.createElement('canvas');
    labelCtxRef.current = labelCanvesRef.current.getContext('2d')!;
  }, []);

  const drawLabel = (image: SVGImageElement) => {
    const { highlight, content } = connectionLineLabel;

    if (content == null || theme == null) {
      return;
    }

    const ctx = labelCtxRef.current!;
    const canvas = labelCanvesRef.current!;
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

    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL());
    image.setAttribute('width', String(width * 0.5));
    image.setAttribute('height', String(height * 0.5));
    image.style[DomUtil.TRANSFORM] = `translate(${width * -0.25}px, ${height * -0.25}px)`;
  };

  const imageRef = useAutorunRef(drawLabel, [connectionLineLabel, device, theme]);

  useEffect(() => {
    if (fontLoaded.current || theme == null || connectionLineLabel.content == null) {
      return;
    }

    const font = `${theme.fontSizeSmall * 2}px Overpass`;

    checkFont(font, connectionLineLabel.content).then(() => {
      drawLabel(imageRef.current!);

      fontLoaded.current = true;
    });
  }, [theme, connectionLineLabel.content]);

  const groupRef = useAutorunRef(
    (g: SVGGElement) => {
      const { centerPoint, rotation } = connectionLineLabel;

      if (centerPoint == null) {
        return;
      }

      g.setAttribute(
        'transform',
        `translate(${centerPoint.x}, ${centerPoint.y}) rotate(${rotation})`
      );
    },
    [connectionLineLabel]
  );

  return (
    <g
      ref={groupRef}
      className={classNames(className, { visible: connectionLineLabel.content != null })}
    >
      <image ref={imageRef} />
    </g>
  );
});

export default styled(withTheme(ConnectionLineLabel))`
  will-change: transform;
  display: none;

  &.visible {
    display: block;
  }
`;
