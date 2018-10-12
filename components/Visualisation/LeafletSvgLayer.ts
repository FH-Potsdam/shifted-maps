import {
  Bounds,
  DomUtil,
  LatLng,
  Layer as LeafletLayer,
  Point,
  point,
  ZoomAnimEvent,
} from 'leaflet';

class LeafletSVGLayer extends LeafletLayer {
  public svg?: SVGSVGElement;

  private center?: LatLng;
  private zoom?: number;
  private position: Point = point(0, 0);
  private size?: Point;

  public onAdd() {
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

  public onRemove() {
    if (this.svg != null) {
      const parent = this.svg.parentNode;

      if (parent != null) {
        parent.removeChild(this.svg);
      }
    }

    return this;
  }

  public getEvents() {
    const events = {
      moveend: this._update,
      viewreset: this._reset,
      zoom: this._handleZoom,
      zoomstart: this._handleZoomStart,
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

    if (this.center != null && this.zoom != null) {
      this._updateTransform(this.center, this.zoom);
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
    this.center = this._map.getCenter();
    this.zoom = this._map.getZoom();

    if (this.svg == null) {
      return;
    }

    const min = this._map.containerPointToLayerPoint(point(0, 0)).round();
    const mapSize = this._map.getSize();
    const bounds = new Bounds(min, min.add(mapSize).round());
    const size = bounds.getSize();

    if (this.size == null || !this.size.equals(size)) {
      this.size = size;

      this.svg.setAttribute('width', String(size.x));
      this.svg.setAttribute('height', String(size.y));
    }

    if (bounds.min != null) {
      this.position = bounds.min;

      this.svg.style[DomUtil.TRANSFORM] = `translate(${bounds.min.x}px, ${bounds.min.y}px)`;
      this.svg.setAttribute('viewBox', [bounds.min.x, bounds.min.y, size.x, size.y].join(' '));
    }
  }

  private _updateTransform(center: LatLng, zoom: number) {
    if (this.svg == null || this.center == null || this.zoom == null) {
      return;
    }

    const scale = this._map.getZoomScale(zoom, this.zoom);
    const viewHalf = this._map.getSize().multiplyBy(0.5);
    const currentCenterPoint = this._map.project(this.center, zoom);
    const destCenterPoint = this._map.project(center, zoom);
    const centerOffset = destCenterPoint.subtract(currentCenterPoint);

    this.position = viewHalf
      .multiplyBy(-scale)
      .add(this.position)
      .add(viewHalf)
      .subtract(centerOffset);

    this.svg.style[DomUtil.TRANSFORM] = `translate(${this.position.x}px, ${
      this.position.y
    }px) scale(${scale})`;
  }
}

export default LeafletSVGLayer;
