import { Control, DomEvent } from 'leaflet';

class LeafletCustomControl extends Control {
  public container?: HTMLDivElement;

  public onAdd() {
    this.container = document.createElement('div');

    // Disable propagation of events to the map when trigged inside the container.
    DomEvent.disableClickPropagation(this.container);
    DomEvent.disableScrollPropagation(this.container);

    return this.container;
  }
}

export default LeafletCustomControl;
