var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return this.props.connection !== nextProps.connection;
  },

  render: function() {
    var connection = this.props.connection;

    if (connection.from.point == null || connection.to.point == null)
      return null;

    return <line x1={connection.from.point.x} y1={connection.from.point.y} x2={connection.to.point.x} y2={connection.to.point.y} className="connection" />;
  }
});