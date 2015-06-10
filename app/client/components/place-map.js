var Reflux = require('reflux'),
  React = require('react'),
  PlaceClip = require('./place-clip');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return this.props.placeShape !== nextProps.placeShape;
  },

  render: function() {
    var shape = this.props.placeShape,
      clipPath = 'url(#' + PlaceClip.createId(shape) + ')';

    return <rect className="place-map" width="200" height="200" x={shape.point.x - 100} y={shape.point.y - 100} clipPath={clipPath} />;
  }
});