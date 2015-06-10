var React = require('react'),
  d3 = require('d3'),
  PlaceCircle = require('./place-circle');

var PlaceClip = module.exports = React.createClass({
  statics: {
    createId: function(placeShape) {
      return 'place-clip-' + placeShape.id;
    }
  },

  componentDidMount: function() {
    var shape = this.props.placeShape;

    d3.select(React.findDOMNode(this))
      .append('clipPath')
      .attr('id', PlaceClip.createId(shape))
      .append('use')
      .attr('xlink:href', '#' + PlaceCircle.createId(shape));
  },

  shouldComponentUpdate: function(nextProps) {
    return false;
  },

  render: function() {
    return <g />;
  }
});