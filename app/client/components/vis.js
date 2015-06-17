var Reflux = require('reflux'),
  React = require('react'),
  visStore = require('../stores/vis'),
  PlaceCircleList = require('./place-circle-list'),
  PlaceClipList = require('./place-clip-list'),
  ConnectionList = require('./connection-list'),
  PlaceList = require('./place-list');

module.exports = React.createClass({
  mixins: [Reflux.connect(visStore, 'vis')],

  render: function() {
    var vis = this.state.vis,
      bounds = vis.get('bounds'),
      transform = vis.get('transform');

    var viewBox = [bounds.min.x, bounds.min.y, bounds.dimensions.x, bounds.dimensions.y].join(' '),
      transformString = L.DomUtil.getTranslateString(transform.get('translate').toObject()),
      scale = transform.get('scale'),
      style = {};

    if (scale != null)
      transformString += ' scale(' + scale + ')';

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