var Reflux = require('reflux'),
  React = require('react'),
  PlaceClip = require('./place-clip');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return nextProps.primary && (this.props.node.point !== nextProps.node.point || this.props.tile !== nextProps.tile);
  },

  render: function() {
    var node = this.props.node,
      tile = this.props.tile,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')',
      radius = node.radius,
      size = radius * 2,
      image = null;

    if (tile != null) {
      image = <image x={node.point.x - tile.radius} y={node.point.y - tile.radius} width={tile.size} height={tile.size} xlinkHref={tile.src} />;
    }

    return (
      <g className="place-map" clipPath={clipPath}>
        <rect className="place-map-background" x={node.point.x - radius} y={node.point.y - radius} width={size} height={size} />
        {image}
      </g>
    );
  }
});