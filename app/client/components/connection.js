var Reflux = require('reflux'),
  React = require('react');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    var edge = this.props.edge;
    return edge.from.point !== nextProps.edge.to.point || edge.strokWidth !== nextProps.edge.strokeWidth;
  },

  render: function() {
    var edge = this.props.edge;

    return <line x1={edge.from.point.x} y1={edge.from.point.y} x2={edge.to.point.x} y2={edge.to.point.y} strokeWidth={edge.strokeWidth} className="connection" />;
  }
});