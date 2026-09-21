import { DomUtil, SVG } from 'leaflet';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import styled from 'styled-components';

interface SVGLayerProps {
  className?: string;
  children?: ReactNode;
}

interface SVGWithContainer extends SVG {
  _container?: HTMLElement;
}

const SVGLayer = ({ children, className }: SVGLayerProps) => {
  const map = useMap();
  const [renderer] = useState<SVGWithContainer>(() => new SVG());
  const [container, setContainer] = useState<HTMLElement>();

  useEffect(() => {
    renderer.addTo(map);

    if (renderer._container != null && className != null) {
      DomUtil.addClass(renderer._container, className);
    }

    setContainer(renderer._container);

    return () => {
      renderer.remove();
    };
  }, [className, map, renderer]);

  if (container == null) {
    return null;
  }

  return createPortal(children, container);
};

export default styled(SVGLayer)`
  overflow: visible;
`;
