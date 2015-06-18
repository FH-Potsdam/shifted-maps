var Reflux = require('reflux'),
  React = require('react'),
  PlaceClip = require('./place-clip'),
  config = require('../config');

module.exports = React.createClass({
  componentDidMount: function() {
    d3.select(React.findDOMNode(this))
      .append('image')
      .attr('width', 500)
      .attr('height', 500);

    this.componentDidUpdate();
  },

  shouldComponentUpdate: function(nextProps) {
    return nextProps.primary && (this.props.node.point !== nextProps.node.point || this.props.tile !== nextProps.tile);
  },

  componentDidUpdate: function() {
    var node = this.props.node;

    d3.select(React.findDOMNode(this))
      .select('image')
      .attr('xlink:href', this.props.tile)
      .attr('x', node.point.x - 250)
      .attr('y', node.point.y - 250);
  },

  render: function() {
    var node = this.props.node,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')';

    return (
      <g className="place-map" clipPath={clipPath} />
    );
  }
});