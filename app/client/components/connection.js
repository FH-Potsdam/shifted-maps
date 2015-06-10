var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return this.props.connectionShape !== nextProps.connectionShape;
  },

  render: function() {
    var shape = this.props.connectionShape;

    if (shape.from == null || shape.to == null)
      return null;

    return <line x1={shape.from.x} y1={shape.from.y} x2={shape.to.x} y2={shape.to.y} strokeWidth={shape.strokeWidth} className="connection" />;
  }
});