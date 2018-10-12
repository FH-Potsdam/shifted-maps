import { MapControl, MapControlProps, withLeaflet, WrappedProps } from 'react-leaflet';
import { Control, DomEvent } from 'leaflet';
import { createPortal } from 'react-dom';

class LeafletCustomControl extends Control {
  container?: HTMLDivElement;

  onAdd() {
    this.container = document.createElement('div');

    // Disable propagation of events to the map when trigged inside the container.
    DomEvent.disableClickPropagation(this.container);
    DomEvent.disableScrollPropagation(this.container);

    return this.container;
  }
}

type Props = MapControlProps & WrappedProps;

class CustomControl extends MapControl<Props, LeafletCustomControl> {
  createLeafletElement(props: Props) {
    return new LeafletCustomControl({ position: props.position });
  }

  componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }

    this.forceUpdate();
  }

  render() {
    if (this.leafletElement.container != null) {
      return createPortal(this.props.children, this.leafletElement.container);
    }

    return null;
  }
}

export default withLeaflet(CustomControl);
