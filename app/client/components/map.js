import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

class Map extends Component {
  componentDidMount() {
    this.map = L.mapbox.map(this.refs.map, this.props.id, {
      maxZoom: 19
    });

    this.map.setView(this.props.center, this.props.zoom);

    this.addEventListeners(this.props);

    // Need to render overlay including children in next tick to let map set the view first and create the corresponding
    // overlay pane element we use here.
    process.nextTick(function() {
      ReactDOM.render(<div className="overlay">{this.props.children}</div>, this.map.getPanes().overlayPane)
    }.bind(this));
  }

  componentDidUpdate(prevProps) {
    this.removeEventListeners(prevProps);
    this.addEventListeners(this.props);
  }

  componentWillUnmount() {
    this.removeEventListeners(this.props);
  }

  addEventListener(name, listener) {
    if (!_.isFunction(listener))
      return;

    name = name.toLowerCase().slice(2); // Strip "on"

    this.map.on(name, listener);
  }

  addEventListeners(listeners) {
    _.each(listeners, (listener, name) => this.addEventListener(name, listener));
  }

  removeEventListener(name, listener) {
    if (!_.isFunction(listener))
      return;

    name = name.toLowerCase().slice(2); // Strip "on"

    this.map.off(name, listener);
  }

  removeEventListeners(listeners) {
    _.each(listeners, (listener, name) => this.removeEventListener(name, listener));
  }

  render() {
    return <div ref="map" className={this.props.className}></div>;
  }
}

export default Map;