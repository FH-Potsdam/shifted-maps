import { createPortal } from 'react-dom';
import { MapControl, MapControlProps, withLeaflet, WrappedProps } from 'react-leaflet';

import LeafletCustomControl from './LeafletCustomControl';

type Props = MapControlProps & WrappedProps;

class CustomControl extends MapControl<Props, LeafletCustomControl> {
  public createLeafletElement(props: Props) {
    return new LeafletCustomControl({ position: props.position });
  }

  public componentDidMount() {
    if (super.componentDidMount) {
      super.componentDidMount();
    }

    this.forceUpdate();
  }

  public render() {
    if (this.leafletElement.container != null) {
      return createPortal(this.props.children, this.leafletElement.container);
    }

    return null;
  }
}

export default withLeaflet(CustomControl);
