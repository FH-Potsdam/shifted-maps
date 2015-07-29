var Reflux = require('reflux'),
  React = require('react');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    var node = this.props.node,
      nextNode = nextProps.node;

    return nextProps.primary && (node.point !== nextNode.point || node.radius !== nextNode.radius || node.strokeWidth !== nextNode.strokeWidth);
  },

  render: function() {
    var node = this.props.node;

    if (node.place.placeType == 'geocode')
      return null;

    var x = node.point.x,
      y = node.point.y + node.radius + node.strokeWidth / 2;

    return (
      <g className="place-label">
        <text className="place-label-stroke" x={x} y={y} textAnchor="middle">{node.place.name}</text>
        <text x={x} y={y} textAnchor="middle">{node.place.name}</text>
      </g>
    );
  }
});