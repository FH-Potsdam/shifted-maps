import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Provider, connect } from 'react-redux';
import store from '../store';
import { app } from '../selector';
import { requestStoryline } from '../actions/storyline';
import { initVis, moveVis, resizeVis, zoomVis } from '../actions/vis';
import { updateScales } from '../actions/scales';
import { updateMapState } from '../actions/map';
import { changeTimeSpan, changeView, updateViews, closeInteractionOverlay } from '../actions/ui';
import { GEOGRAPHIC_VIEW } from '../models/views';
import LoadingScreen from './loading-screen';
import InteractionOverlay from './interaction-overlay';
import Map from './map';
import Vis from './vis';
import Scales from './scales';
import UI from './ui';
import TryOwnData from './try-own-data';
import Logout from './logout';

class App extends Component {
  constructor(props) {
    super(props);

    this._dragging = false;
  }

  shouldComponentUpdate(nextProps) {
    let { map, ui, stats } = this.props;

    return map !== nextProps.map || ui !== nextProps.ui || stats !== nextProps.stats;
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
  }

  onMapResize(event) {
    let { dispatch } = this.props;

    dispatch(resizeVis(event.target, event));
  }

  onMapZoomAnim(event) {
    this.props.dispatch(zoomVis(event.target, event));
  }

  onTimeSpanChange(timeSpan) {
    let { dispatch } = this.props;

    dispatch(changeTimeSpan(timeSpan));
    //dispatch(requestTiles());
    dispatch(updateViews());
  }

  onViewChange(view) {
    let { dispatch } = this.props;

    dispatch(changeView(view));
  }

  onScaleUpdate(scaleElements, sizerElements) {
    let { dispatch } = this.props;

    dispatch(updateScales(scaleElements, sizerElements));
    //dispatch(requestTiles());
  }

  onInteractionOverlayClose() {
    let { dispatch } = this.props;

    dispatch(closeInteractionOverlay());
  }

  render() {
    let { map, ui, stats } = this.props,
      children = [];

    if (ui.get('interactionOverlay') && ENV.exhibition) {
      children.push(
        <InteractionOverlay key="interaction-overlay"
                            onClose={this.onInteractionOverlayClose.bind(this)}/>
      );
    }

    if (!ui.get('storylineLoaded')) {
      children.push(
        <LoadingScreen key="loading-screen" stats={stats}/>
      );
    }

    if (ui.get('storylineLoaded')) {
      children.push(
        ui.get('authorized') ? <Logout key="logout"/> : <TryOwnData key="try-own-data"/>
      );

      children.push(
        <Map key="map" id={map.get('id')}
             zoom={map.get('zoom')}
             center={map.get('center')}
             bounds={map.get('bounds')}
             className="app__map"
             active={ui.get('activeView') == null}
             onViewReset={this.onMapViewReset.bind(this)}
             onDragStart={this.onMapDragStart.bind(this)}
             onMoveEnd={this.onMapMoveEnd.bind(this)}
             onResize={this.onMapResize.bind(this)}
             onZoomAnim={this.onMapZoomAnim.bind(this)}>
          <Provider store={store}>
            <Vis className="leaflet-zoom-animated"/>
          </Provider>
        </Map>,
        <UI key="ui"
            ui={ui}
            stats={stats}
            onTimeSpanChange={this.onTimeSpanChange.bind(this)}
            onViewChange={this.onViewChange.bind(this)} />,
        <Scales key="scales" onUpdate={this.onScaleUpdate.bind(this)} />
      );
    }

    return (
      <div className="app">
        <ReactCSSTransitionGroup key="overlays" transitionName="fade"
                                 transitionEnterTimeout={400} transitionLeaveTimeout={400}>
          {children}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default connect(app)(App);