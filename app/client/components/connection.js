var Reflux = require('reflux'),
  React = require('react');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    var { edge, primary } = this.props;

    return primary !== nextProps.primary ||
      edge.from.point !== nextProps.edge.to.point ||
      edge.strokWidth !== nextProps.edge.strokeWidth;
  },

  render: function() {
    var { edge, primary } = this.props,
      style = { display: 'none' };

    if (primary)
      style.display = 'block';

    return <line style={style} x1={edge.from.point.x} y1={edge.from.point.y} x2={edge.to.point.x} y2={edge.to.point.y} strokeWidth={edge.strokeWidth} className="connection" />;
  }
});