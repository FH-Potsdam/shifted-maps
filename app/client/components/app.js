import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import config from '../config';
import store from '../store';
import { fetchStoryline, initMap, moveMap, resizeMap, zoomMap, updateScales } from '../actions';
import Map from './map';
import Vis from './vis';
import Scales from './scales';

class App extends Component {
  constructor(props) {
    super(props);

    this._dragging = false;

    this.state = {
      mapId: config.mapbox.id,
      mapZoom: 10,
      mapCenter: [52.520007, 13.404954]
    };
  }

  componentDidMount() {
    this.props.dispatch(fetchStoryline());
  }

  onMapViewReset(event) {
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
  }

  onMapResize(event) {
    this.props.dispatch(resizeMap(event.target, event));
  }

  onMapZoomAnim(event) {
    this.props.dispatch(zoomMap(event.target, event));
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
             onViewReset={this.onMapViewReset.bind(this)}
             onDragStart={this.onMapDragStart.bind(this)}
             onDragEnd={this.onMapMoveEnd.bind(this)}
             onResize={this.onMapResize.bind(this)}
             onZoomAnim={this.onMapZoomAnim.bind(this)}>
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