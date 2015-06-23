var Reflux = require('reflux'),
  React = require('react'),
  Immutable = require('immutable'),
  visStore = require('../stores/vis'),
  PlaceCircleList = require('./place-circle-list'),
  PlaceClipList = require('./place-clip-list'),
  ConnectionList = require('./connection-list'),
  PlaceList = require('./place-list');

module.exports = React.createClass({
  mixins: [Reflux.connect(visStore, 'vis')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.vis !== nextState.vis;
  },

  render: function() {
    var vis = this.state.vis.toJS(),
      bounds = vis.bounds,
      transform = vis.transform;

    var viewBox = [bounds.min.x, bounds.min.y, bounds.dimensions.x, bounds.dimensions.y].join(' '),
      transformString = L.DomUtil.getTranslateString(transform.translate),
      style = {};

    if (transform.scale != null)
      transformString += ' scale(' + transform.scale + ')';

    style[L.DomUtil.TRANSFORM] = transformString;

    return (
      <svg className={this.props.className} width={bounds.dimensions.x} height={bounds.dimensions.y} viewBox={viewBox} style={style}>
        <defs>
          <PlaceCircleList />
          <PlaceClipList />
        </defs>

        <ConnectionList />
        <PlaceList />
      </svg>
    );
  }
});