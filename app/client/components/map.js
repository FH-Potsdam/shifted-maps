import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import $ from 'jquery';

function computeEventName(name) {
  return name.toLowerCase().slice(2); // Strip "on"
}

function pickListeners(props) {
  return _.pick(props, _.isFunction);
}

class Map extends Component {
  componentDidMount() {
    let { id, center, zoom } = this.props,
      attribution;

    this.map = L.mapbox.map(this.refs.map, id, {
      maxZoom: 19
    });

    this.addEventListeners(pickListeners(this.props));

    this.map.setView(center, zoom);
    this.map.zoomControl.removeFrom(this.map);

    if (ENV.exhibition) {
      this.map.attributionControl.removeFrom(this.map);

      L.control.attribution({ prefix: '' })
        .addAttribution('© Mapbox, © OpenStreetMap')
        .addTo(this.map);
    }

    // Need to render overlay including children in next tick to let map set the view first and create the corresponding
    // overlay pane element we use here.
    process.nextTick(function() {
      ReactDOM.render(<div className="overlay">{this.props.children}</div>, this.map.getPanes().overlayPane)
    }.bind(this));
  }

  componentWillUpdate(nextProps) {
    let nextListeners = pickListeners(nextProps),
      listeners = this.props;

    nextListeners = _.pick(nextListeners, function(listener, name) {
      return listeners[name] !== listener;
    });

    listeners = _.pick(listeners, _.keys(nextListeners))

    this.removeEventListeners(listeners);
    this.addEventListeners(nextListeners);
  }

  componentDidUpdate() {
    let { bounds } = this.props;

    if (bounds != null) {
      this.map.fitBounds(bounds);
    }

    $(this.refs.map).toggleClass('active', this.props.active);
  }

  componentWillUnmount() {
    this.map.remove();
  }

  addEventListener(name, listener) {
    this.map.on(computeEventName(name), listener);
  }

  addEventListeners(listeners) {
    _.each(listeners, (listener, name) => this.addEventListener(name, listener));
  }

  removeEventListener(name, listener) {
    this.map.off(computeEventName(name), listener);
  }

  removeEventListeners(listeners) {
    _.each(listeners, (listener, name) => this.removeEventListener(name, listener));
  }

  render() {
    return <div ref="map" className={this.props.className}></div>;
  }
}

export default Map;