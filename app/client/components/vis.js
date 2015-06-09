var Reflux = require('reflux'),
  React = require('react'),
  visStore = require('../stores/vis'),
  PlaceCircles = require('./place-circles'),
  PlaceMaps = require('./place-maps'),
  Connections = require('./connections');

module.exports = React.createClass({
  mixins: [Reflux.connect(visStore, 'vis')],

  render: function() {
    var vis = this.state.vis,
      bounds = vis.get('bounds'),
      boundsMin = bounds.get('min'),
      boundsSize = bounds.get('size'),
      transform = vis.get('transform');

    var viewBox = [boundsMin.get('x'), boundsMin.get('y'), boundsSize.get('x'), boundsSize.get('y')].join(' '),
      transformString = L.DomUtil.getTranslateString(transform.get('translate').toObject()),
      scale = transform.get('scale'),
      style = {};

    if (scale != null)
      transformString += ' scale(' + scale + ')';

    style[L.DomUtil.TRANSFORM] = transformString;

    return (
      <svg className={this.props.className} width={boundsSize.get('x')} height={boundsSize.get('y')} viewBox={viewBox} style={style}>
        <defs>
          <PlaceCircles />
        </defs>
        <Connections />
        <PlaceMaps />
      </svg>
    );
  }
});