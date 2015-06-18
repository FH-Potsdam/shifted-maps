var React = require('react'),
  d3 = require('d3'),
  PlaceCircle = require('./place-circle');

module.exports = React.createClass({
  componentDidMount: function() {
    var node = this.props.node;

    d3.select(React.findDOMNode(this))
      .append('use')
      .attr('xlink:href', '#' + PlaceCircle.createId(node));
  },

  shouldComponentUpdate: function(nextProps) {
    return nextProps.primary && this.props.node.strokeWidth !== nextProps.node.strokeWidth;
  },

  render: function() {
    return <g className="place-deco" strokeWidth={this.props.node.strokeWidth} />;
  }
});