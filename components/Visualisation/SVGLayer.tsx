import { createPortal } from 'react-dom';
import { MapLayer, MapLayerProps, withLeaflet, WrappedProps } from 'react-leaflet';

import LeafletSVGLayer from './LeafletSvgLayer';

class SVGLayer extends MapLayer<MapLayerProps & WrappedProps, LeafletSVGLayer> {
  public createLeafletElement() {
    return new LeafletSVGLayer();
  }

  public componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }

    this.forceUpdate();
  }

  public render() {
    if (this.leafletElement.svg != null) {
      return createPortal(this.props.children, this.leafletElement.svg);
    }

    return null;
  }
}

// @TODO Use withLeaflet as decorator once types are updated.
export default withLeaflet(SVGLayer);
