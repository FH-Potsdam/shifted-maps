var Reflux = require('reflux'),
  React = require('react');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return nextProps.primary && this.props.node !== nextProps.node;
  },

  render: function() {
    var node = this.props.node;

    return (
      <text className="place-label" x={node.point.x} y={node.point.y + node.radius + node.strokeWidth / 2} textAnchor="middle">{node.place.name}</text>
    );
  }
});