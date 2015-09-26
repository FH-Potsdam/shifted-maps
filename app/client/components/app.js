import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import store from '../store';
import { app } from '../selector';
import { requestStoryline } from '../actions/storyline';
import { initVis, moveVis, resizeVis, zoomVis } from '../actions/vis';
import { updateScales } from '../actions/scales';
import { requestTiles } from '../actions/tiles';
import { updateMapState } from '../actions/map';
import Map from './map';
import Vis from './vis';
import Scales from './scales';

class App extends Component {
  constructor(props) {
    super(props);

    this._dragging = false;
    this._firstZoom = true;
  }

  componentDidMount() {
    this.props.dispatch(requestStoryline());
  }

  onMapInit(event) {
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

  onScaleUpdate(elements) {
    this.props.dispatch(updateScales(elements));
  }

  render() {
    let { map } = this.props;

    return (
      <div className="app">
        <Map id={map.get('id')}
             zoom={map.get('zoom')}
             center={map.get('center')}
             bounds={map.get('bounds')}
             className="app-map"
             onViewReset={this.onMapInit.bind(this)}
             onDragStart={this.onMapDragStart.bind(this)}
             onMoveEnd={this.onMapMoveEnd.bind(this)}
             onResize={this.onMapResize.bind(this)}
             onZoomAnim={this.onMapZoomAnim.bind(this)}
             onZoomEnd={this.onMapZoomEnd.bind(this)}>
          <Provider store={store}>
            <Vis className="leaflet-zoom-animated" />
          </Provider>
        </Map>
        <Scales onUpdate={this.onScaleUpdate.bind(this)} />
        {/*<Ui />*/}
      </div>
    );
  }
}

export default connect(app)(App);