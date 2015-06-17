var React = require('react'),
  d3 = require('d3'),
  PlaceCircle = require('./place-circle');

var PlaceClip = module.exports = React.createClass({
  statics: {
    createId: function(node) {
      return 'place-clip-' + node.id;
    }
  },

  componentDidMount: function() {
    var node = this.props.node;

    d3.select(React.findDOMNode(this))
      .append('clipPath')
      .attr('id', PlaceClip.createId(node))
      .append('use')
      .attr('xlink:href', '#' + PlaceCircle.createId(node));
  },

  shouldComponentUpdate: function(nextProps) {
    return false;
  },

  render: function() {
    return <g />;
  }
});