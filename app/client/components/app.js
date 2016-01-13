import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Provider, connect } from 'react-redux';
import store from '../store';
import { app as appSelector } from '../selector';
import { requestStoryline } from '../actions/storyline';
import { initVis, moveVis, resizeVis, zoomVis } from '../actions/vis';
import { updateScales } from '../actions/scales';
import { updateMapState } from '../actions/map';
import { changeTimeSpan, changeView, closeInteractionOverlay } from '../actions/ui';
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
    this.props.onMount();
  }

  // Prevent to fire map move event when map was dragged
  onMapDragStart() {
    this._dragging = true;
  }

  onMapMoveEnd(event) {
    if (!this._dragging)
      return;

    this._dragging = false;
    this.props.onMapMoveEnd(event);
  }

  render() {
    let { map, ui, stats } = this.props,
      children = [];

    if (ui.get('interactionOverlay') && ENV.exhibition) {
      children.push(
        <InteractionOverlay key="interaction-overlay" onClose={this.props.onInteractionOverlayClose}/>
      );
    }

    if (!ui.get('storylineLoaded')) {
      children.push(
        <LoadingScreen key="loading-screen" stats={stats}/>
      );
    } else {
      children.push(ui.get('authorized') ? <Logout key="logout"/> : <TryOwnData key="try-own-data"/>,
        <Map key="map" id={map.get('id')} zoom={map.get('zoom')} center={map.get('center')} bounds={map.get('bounds')}
             className="app__map" active={ui.get('activeView') == null}
             onViewReset={this.props.onMapViewReset}
             onDragStart={this.onMapDragStart.bind(this)}
             onMoveEnd={this.onMapMoveEnd.bind(this)}
             onResize={this.props.onMapResize}
             onZoomAnim={this.props.onMapZoomAnim}>
          <Provider store={store}>
            <Vis className="leaflet-zoom-animated"/>
          </Provider>
        </Map>,
        <UI key="ui" ui={ui} stats={stats}
            onTimeSpanChange={this.props.onTimeSpanChange}
            onViewChange={this.props.onViewChange} />,
        <Scales key="scales" onUpdate={this.props.onScaleUpdate} />
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

function mapDispatchToProps(dispatch) {
  return {
    onMount: () => dispatch(requestStoryline()),
    onMapViewReset: event => {
      dispatch(updateMapState(event.target));
      dispatch(initVis(event.target, event));
    },
    onMapMoveEnd: event => dispatch(moveVis(event.target, event)),
    onMapResize: event => dispatch(resizeVis(event.target, event)),
    onMapZoomAnim: event => dispatch(zoomVis(event.target, event)),
    onTimeSpanChange: timeSpan => dispatch(changeTimeSpan(timeSpan)),
    onViewChange: view => dispatch(changeView(view)),
    onScaleUpdate: (scaleElements, sizerElements) => dispatch(updateScales(scaleElements, sizerElements)),
    onInteractionOverlayClose: () => dispatch(closeInteractionOverlay())
  }
}

export default connect(appSelector, mapDispatchToProps)(App);