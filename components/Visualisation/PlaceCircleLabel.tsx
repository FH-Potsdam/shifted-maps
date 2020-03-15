import classNames from 'classnames';
import { DomUtil } from 'leaflet';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import PlaceCircle from '../../stores/PlaceCircle';
import checkFont from '../../utils/checkFont';
import styled, { withTheme } from '../styled';
import { Theme } from '../theme';
import { DEVICE } from './Visualisation';
import useAutorun from '../../hooks/useAutorun';

interface PlaceCircleLabelProps {
  placeCircle: PlaceCircle;
  device: DEVICE;
  className?: string;
  theme?: Theme;
}

const PlaceCircleLabel = observer(({ className, placeCircle, theme, device }: PlaceCircleLabelProps) => {
  const { highlight, strokeWidth, radius, children, place } = placeCircle;
  const ref = useRef<SVGImageElement>(null);
  const offset = strokeWidth * 0.5 + 4 + radius;

  if (theme == null) {
    throw new Error('Missing theme.');
  }

  const [canvas] = useState(() => document.createElement('canvas'));
  const [ctx] = useState(() => canvas.getContext('2d')!);

  const drawLabel = useCallback(() => {
    const element = ref.current;

    if (element == null) {
      return;
    }

    const { children, place, active } = placeCircle;

    const clusterSize = children.length;
    const label = place.name;

    const mobileOrTablet = device === DEVICE.mobile || device === DEVICE.tablet;

    const labelFontSize = mobileOrTablet ? theme.fontSizeSmall : theme.fontSize;
    const clusterLabelFontSize = mobileOrTablet ? theme.fontSizeMini : theme.fontSizeSmall;
    const spacing = theme.spacingUnit;

    const clusterLabel = clusterSize > 0 ? `+${clusterSize} other ${clusterSize === 1 ? 'place' : 'places'}` : null;

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
    ctx.fillStyle = active ? theme.highlightColor : theme.foregroundColor;
    ctx.strokeStyle = theme.backgroundColor;

    const baseline = labelFontSize * 2;

    ctx.textAlign = 'center';
    ctx.font = `${labelFontSize * 2}px "Overpass"`;
    ctx.strokeText(label, width / 2, baseline);
    ctx.fillText(label, width / 2, baseline);

    if (clusterLabel != null) {
      const baseline = clusterLabelFontSize * 2 + labelFontSize * 2 + spacing / 2;

      ctx.font = `${clusterLabelFontSize * 2}px "Overpass"`;
      ctx.strokeText(clusterLabel, width / 2, baseline);
      ctx.fillText(clusterLabel, width / 2, baseline);
    }

    element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL());
    element.setAttribute('width', String(width * 0.5));
    element.setAttribute('height', String(height * 0.5));
    element.style[DomUtil.TRANSFORM] = `translateX(${Math.round(width * -0.25)}px)`;
  }, [theme, placeCircle, device, ref.current]);

  useAutorun(drawLabel);

  useEffect(() => {
    const clusterSize = children.length;
    const label = place.name;

    const labelFontSize = theme.fontSize;
    const clusterLabelFontSize = theme.fontSizeSmall;

    const clusterLabel = clusterSize > 0 ? `+${clusterSize} other ${clusterSize === 1 ? 'place' : 'places'}` : null;

    checkFont(`${labelFontSize * 2}px "Overpass"`, label).then(drawLabel);

    if (clusterLabel) {
      checkFont(`${clusterLabelFontSize * 2}px "Overpass"`, clusterLabel).then(drawLabel);
    }
  }, [children, place, theme, drawLabel]);

  return (
    <g className={classNames(className, { visible: highlight })} transform={`translate(0, ${Math.round(offset)})`}>
      <image ref={ref} />
    </g>
  );
});

export default styled(withTheme(PlaceCircleLabel))`
  transition: opacity ${props => props.theme.shortTransitionDuration};
  pointer-events: none;
  opacity: 0;

  &.visible {
    opacity: 1;
  }
`;
