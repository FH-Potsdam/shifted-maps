var Reflux = require('reflux'),
  React = require('react'),
  PlaceClip = require('./place-clip');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return this.props.node !== nextProps.node;
  },

  render: function() {
    var node = this.props.node,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')';

    return <rect className="place-map" width="200" height="200" x={node.point.x - 100} y={node.point.y - 100} clipPath={clipPath} />;
  }
});