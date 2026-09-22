import { DomUtil, SVG } from 'leaflet';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import styled from 'styled-components';
import { SVG_RENDER_PADDING } from '../../stores/config';

interface SVGLayerProps {
  className?: string;
  children?: ReactNode;
}

interface SVGWithContainer extends SVG {
  _container?: HTMLElement;
}

const SVGLayer = ({ children, className }: SVGLayerProps) => {
  const map = useMap();
  const [renderer] = useState<SVGWithContainer>(() => new SVG({ padding: SVG_RENDER_PADDING }));
  const [container, setContainer] = useState<HTMLElement>();

  useEffect(() => {
    const handleAdd = () => {
      const element = renderer._container;

      if (element == null) {
        return;
      }

      if (className != null) {
        DomUtil.addClass(element, className);
      }

      setContainer(element);
    };

    renderer.on('add', handleAdd);
    renderer.addTo(map);

    return () => {
      renderer.off('add', handleAdd);
      renderer.remove();
    };
  }, [className, map, renderer]);

  if (container == null) {
    return null;
  }

  return createPortal(children, container);
};

export default styled(SVGLayer)`
  overflow: hidden;
`;
