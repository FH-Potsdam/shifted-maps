import { SVG } from 'leaflet';
import { createPortal } from 'react-dom';
import { MapLayer, MapLayerProps, withLeaflet, WrappedProps } from 'react-leaflet';

class SVGLayer extends MapLayer<MapLayerProps & WrappedProps, SVG> {
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
    // @ts-ignore private property
    if (this.leafletElement._container != null) {
      // @ts-ignore private property
      return createPortal(this.props.children, this.leafletElement._container);
    }

    return null;
  }
}

// @TODO Use withLeaflet as decorator once types are updated.
export default withLeaflet(SVGLayer);
