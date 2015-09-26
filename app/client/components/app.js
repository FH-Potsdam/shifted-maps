import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import config from '../config';
import store from '../store';
import { requestStoryline, initMap, moveMap, resizeMap, zoomMap, updateScales, requestTiles } from '../actions';
import Map from './map';
import Vis from './vis';
import Scales from './scales';

class App extends Component {
  constructor(props) {
    super(props);

    this._dragging = false;
    this._firstZoom = true;

    this.state = {
      mapId: config.mapbox.id,
      mapZoom: 10,
      mapCenter: [52.520007, 13.404954]
    };
  }

  componentDidMount() {
    this.props.dispatch(requestStoryline());
  }

  onMapInit(event) {
    this.props.dispatch(initMap(event.target, event));
  }

  onMapDragStart() {
    this._dragging = true;
  }

  onMapMoveEnd(event) {
    if (!this._dragging)
      return;

    this._dragging = false;
    this.props.dispatch(moveMap(event.target, event));
    this.props.dispatch(requestTiles());
  }

  onMapResize(event) {
    this.props.dispatch(resizeMap(event.target, event));
    this.props.dispatch(requestTiles());
  }

  onMapZoomAnim(event) {
    this.props.dispatch(zoomMap(event.target, event));
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
    return (
      <div className="app">
        <Map id={this.state.mapId}
             zoom={this.state.mapZoom}
             center={this.state.mapCenter}
             className="app-map"
             onViewReset={this.onMapInit.bind(this)}
             onDragStart={this.onMapDragStart.bind(this)}
             onDragEnd={this.onMapMoveEnd.bind(this)}
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

export default connect()(App);