import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import store from '../store';
import { app } from '../selector';
import { requestStoryline } from '../actions/storyline';
import { initVis, moveVis, resizeVis, zoomVis } from '../actions/vis';
import { updateScales } from '../actions/scales';
import { requestTiles } from '../actions/tiles';
import { updateMapState } from '../actions/map';
import { changeTimeSpan, changeView, updateViews } from '../actions/ui';
import { GEOGRAPHIC_VIEW } from '../models/views';
import Map from './map';
import Vis from './vis';
import Scales from './scales';
import UI from './ui';

class App extends Component {
  constructor(props) {
    super(props);

    this._dragging = false;
    this._firstZoom = true;
  }

  shouldComponentUpdate(nextProps) {
    let { map, ui } = this.props;

    return map !== nextProps.map || ui !== nextProps.ui;
  }

  componentDidMount() {
    let { dispatch } = this.props;

    dispatch(requestStoryline());
  }

  onMapViewReset(event) {
    let { dispatch } = this.props;

    dispatch(updateMapState(event.target));
    dispatch(initVis(event.target, event));
  }

  onMapDragStart() {
    this._dragging = true;
  }

  onMapMoveEnd(event) {
    if (!this._dragging)
      return;

    let { dispatch } = this.props;

    this._dragging = false;
    dispatch(moveVis(event.target, event));
    dispatch(requestTiles());
  }

  onMapResize(event) {
    let { dispatch } = this.props;

    dispatch(resizeVis(event.target, event));
    dispatch(requestTiles());
  }

  onMapZoomAnim(event) {
    this.props.dispatch(zoomVis(event.target, event));
  }

  onMapZoomEnd() {
    if (!this._firstZoom)
      this.props.dispatch(requestTiles());

    this._firstZoom = false;
  }

  onTimeSpanChange(timeSpan) {
    let { dispatch } = this.props;

    dispatch(changeTimeSpan(timeSpan));
    dispatch(requestTiles());
    dispatch(updateViews());
  }

  onViewChange(view) {
    let { dispatch } = this.props;

    dispatch(changeView(view));
  }

  onScaleUpdate(scaleElements, sizerElements) {
    let { dispatch } = this.props;

    dispatch(updateScales(scaleElements, sizerElements));
    dispatch(requestTiles());
  }

  render() {
    let { map, ui } = this.props,
      mapClassName = 'app-map';

    return (
      <div className="app">
        <Map id={map.get('id')}
             zoom={map.get('zoom')}
             center={map.get('center')}
             bounds={map.get('bounds')}
             className="app-map"
             active={ui.get('activeView') == null}
             onViewReset={this.onMapViewReset.bind(this)}
             onDragStart={this.onMapDragStart.bind(this)}
             onMoveEnd={this.onMapMoveEnd.bind(this)}
             onResize={this.onMapResize.bind(this)}
             onZoomAnim={this.onMapZoomAnim.bind(this)}
             onZoomEnd={this.onMapZoomEnd.bind(this)}>
          <Provider store={store}>
            <Vis className="leaflet-zoom-animated" />
          </Provider>
        </Map>
        <UI ui={ui} onTimeSpanChange={this.onTimeSpanChange.bind(this)} onViewChange={this.onViewChange.bind(this)} />
        <Scales onUpdate={this.onScaleUpdate.bind(this)} />
      </div>
    );
  }
}

export default connect(app)(App);