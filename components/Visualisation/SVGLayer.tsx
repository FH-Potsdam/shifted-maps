import { DomUtil, SVG } from 'leaflet';
import { createPortal } from 'react-dom';
import { MapLayer, MapLayerProps, withLeaflet, WrappedProps } from 'react-leaflet';

import styled from '../styled';

interface IProps {
  className?: string;
}

class SVGLayer extends MapLayer<MapLayerProps & WrappedProps & IProps, SVG> {
  createLeafletElement() {
    return new SVG();
  }

  componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }

    this.forceUpdate();
  }

  render() {
    const { className } = this.props;
    // @ts-ignore private property
    const container: HTMLElement | void = this.leafletElement._container;

    if (container == null) {
      return null;
    }

    if (className != null) {
      DomUtil.addClass(container, className);
    }

    return createPortal(this.props.children, container);
  }
}

// @TODO Use withLeaflet as decorator once types are updated.
export default styled(withLeaflet(SVGLayer))`
  overflow: visible;
`;
