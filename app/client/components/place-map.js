var Reflux = require('reflux'),
  React = require('react'),
  PlaceClip = require('./place-clip'),
  config = require('../config');

module.exports = React.createClass({
  componentDidMount: function() {
    d3.select(React.findDOMNode(this))
      .append('image');

    this.componentDidUpdate();
  },

  shouldComponentUpdate: function(nextProps) {
    return nextProps.primary && (this.props.node.point !== nextProps.node.point || this.props.tile !== nextProps.tile);
  },

  componentDidUpdate: function(lastProps) {
    var node = this.props.node,
      tile = this.props.tile;

    var image = d3.select(React.findDOMNode(this))
      .select('image')
      .attr('display', tile != null ? 'block' : 'none');

    if (tile == null)
      return;

    image.attr('xlink:href', tile.src)
      .attr('x', node.point.x - tile.radius)
      .attr('y', node.point.y - tile.radius)
      .attr('width', tile.size)
      .attr('height', tile.size);

    if (lastProps != null && lastProps.tile != tile) {
      image.style('opacity', 0)
        .transition()
        .duration(400)
        .style('opacity', 1);
    }
  },

  render: function() {
    var node = this.props.node,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')',
      radius = node.radius,
      size = radius * 2;

    return (
      <g className="place-map" clipPath={clipPath}>
        <rect className="place-map-background" x={node.point.x - radius} y={node.point.y - radius} width={size} height={size} />
      </g>
    );
  }
});