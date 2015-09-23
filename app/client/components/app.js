import React, { Component } from 'react';
import { connect } from 'react-redux';
import config from '../config';
import selector from '../redux/selector';
import { fetchStoryline, moveVis, resizeVis, zoomVis } from '../redux/actions';
import Map from './map';
import Vis from './vis';

  //InitAction = require('../actions/init'),
  //Vis = require('./vis'),
  //Ui = require('./ui'),

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

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.props.dispatch(fetchStoryline());
  }

  onDragStart() {
    this._dragging = true;
  }

  onMoveEnd(event) {
    if (!this._dragging)
      return;

    this._dragging = false;
    this.props.dispatch(moveVis(event.target));
  }

  render() {
    let { dispatch } = this.props;

    return (
      <div className="app">
        <Map id={this.state.mapId}
             zoom={this.state.mapZoom}
             center={this.state.mapCenter}
             className="app-map"
             onDragStart={this.onDragStart.bind(this)}
             onDragEnd={this.onMoveEnd.bind(this)}
             onResize={event => dispatch(resizeVis(event.target))}
             onZoomAnim={event => dispatch(zoomVis(event.target, event))}>
          <Vis className="leaflet-zoom-animated" />
        </Map>
        {/*<Ui />*/}
      </div>
    );
  }
}

export default connect(selector)(App);