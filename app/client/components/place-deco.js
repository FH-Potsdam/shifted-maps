var React = require('react'),
  PlaceCircle = require('./place-circle');

module.exports = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return nextProps.primary && this.props.node.strokeWidth !== nextProps.node.strokeWidth;
  },

  render: function() {
    var node = this.props.node;

    return (
      <g className="place-deco" strokeWidth={node.strokeWidth}>
        <use xlinkHref={'#' + PlaceCircle.createId(node)} />
      </g>
    );
  }
});