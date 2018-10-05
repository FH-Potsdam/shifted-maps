import { withLeaflet, MapLayer, WrappedProps, MapLayerProps } from 'react-leaflet';
import {
  Layer as LeafletLayer,
  Bounds,
  LatLng,
  Point,
  point,
  DomUtil,
  ZoomAnimEvent,
} from 'leaflet';
import { createPortal } from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

class LeafletSVGLayer extends LeafletLayer {
  @observable.ref
  svg?: SVGSVGElement;

  private _center?: LatLng;
  private _zoom?: number;
  private _position: Point = point(0, 0);
  private _size?: Point;

  @action
  onAdd() {
    if (this.svg == null) {
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.style.pointerEvents = 'none';
      this.svg.style.overflow = 'visible';
      this.svg.classList.add('leaflet-zoom-animated');
    }

    const pane = this.getPane();

    if (pane != null) {
      pane.appendChild(this.svg);
    }

    this._update();

    return this;
  }

  onRemove() {
    if (this.svg != null) {
      const parent = this.svg.parentNode;

      if (parent != null) {
        parent.removeChild(this.svg);
      }
    }

    return this;
  }

  getEvents() {
    const events = {
      viewreset: this._reset,
      zoom: this._handleZoom,
      zoomstart: this._handleZoomStart,
      moveend: this._update,
    };

    // @ts-ignore private
    if (this._zoomAnimated) {
      // @ts-ignore private
      events.zoomanim = this._handleZoomAnimate;
    }

    return events;
  }

  private _reset() {
    this._update();

    if (this._center != null && this._zoom != null) {
      this._updateTransform(this._center, this._zoom);
    }
  }

  private _handleZoom() {
    this._updateTransform(this._map.getCenter(), this._map.getZoom());
  }

  private _handleZoomStart() {
    this._update();
  }

  private _handleZoomAnimate(event: ZoomAnimEvent) {
    this._updateTransform(event.center, event.zoom);
  }

  private _update() {
    this._center = this._map.getCenter();
    this._zoom = this._map.getZoom();

    if (this.svg == null) {
      return;
    }

    const min = this._map.containerPointToLayerPoint(point(0, 0)).round();
    const mapSize = this._map.getSize();
    const bounds = new Bounds(min, min.add(mapSize).round());
    const size = bounds.getSize();

    if (this._size == null || !this._size.equals(size)) {
      this._size = size;

      this.svg.setAttribute('width', String(size.x));
      this.svg.setAttribute('height', String(size.y));
    }

    if (bounds.min != null) {
      this._position = bounds.min;

      this.svg.style[DomUtil.TRANSFORM] = `translate(${bounds.min.x}px, ${bounds.min.y}px)`;
      this.svg.setAttribute('viewBox', [bounds.min.x, bounds.min.y, size.x, size.y].join(' '));
    }
  }

  private _updateTransform(center: LatLng, zoom: number) {
    if (this.svg == null || this._center == null || this._zoom == null) {
      return;
    }

    const scale = this._map.getZoomScale(zoom, this._zoom);
    const viewHalf = this._map.getSize().multiplyBy(0.5);
    const currentCenterPoint = this._map.project(this._center, zoom);
    const destCenterPoint = this._map.project(center, zoom);
    const centerOffset = destCenterPoint.subtract(currentCenterPoint);

    this._position = viewHalf
      .multiplyBy(-scale)
      .add(this._position)
      .add(viewHalf)
      .subtract(centerOffset);

    this.svg.style[DomUtil.TRANSFORM] = `translate(${this._position.x}px, ${
      this._position.y
    }px) scale(${scale})`;
  }
}

@observer
class SVGLayer extends MapLayer<MapLayerProps & WrappedProps, LeafletSVGLayer> {
  createLeafletElement() {
    return new LeafletSVGLayer();
  }

  render() {
    if (this.leafletElement.svg != null) {
      return createPortal(this.props.children, this.leafletElement.svg);
    }

    return null;
  }
}

// @TODO Use withLeaflet as decorator once types are updated.
export default withLeaflet(SVGLayer);
