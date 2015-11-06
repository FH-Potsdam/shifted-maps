import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import pick from 'lodash/object/pick';
import keys from 'lodash/object/keys';
import isFunction from 'lodash/lang/isFunction';
import forEach from 'lodash/collection/forEach';
import classNames from 'classnames/dedupe';

function computeEventName(name) {
  return name.toLowerCase().slice(2); // Strip "on"
}

function pickListeners(props) {
  return pick(props, isFunction);
}

class Map extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.bounds !== nextProps.bounds ||
      this.props.active !== nextProps.active;
  }

  componentDidMount() {
    let { id, center, zoom } = this.props;

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

  componentDidUpdate() {
    let { bounds, active } = this.props,
      map = this.refs.map;

    if (bounds != null) {
      this.map.fitBounds(bounds);
    }

    map.className = classNames(map.className, { active });
  }

  componentWillUnmount() {
    this.map.remove();
  }

  addEventListener(name, listener) {
    this.map.on(computeEventName(name), listener);
  }

  addEventListeners(listeners) {
    forEach(listeners, (listener, name) => this.addEventListener(name, listener));
  }

  removeEventListener(name, listener) {
    this.map.off(computeEventName(name), listener);
  }

  removeEventListeners(listeners) {
    forEach(listeners, (listener, name) => this.removeEventListener(name, listener));
  }

  render() {
    return <div ref="map" className={this.props.className}></div>;
  }
}

export default Map;