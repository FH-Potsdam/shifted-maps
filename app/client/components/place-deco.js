var React = require('react'),
  d3 = require('d3'),
  PlaceCircle = require('./place-circle');

module.exports = React.createClass({
  componentDidMount: function() {
    var shape = this.props.placeShape;

    d3.select(React.findDOMNode(this))
      .append('use')
      .attr('xlink:href', '#' + PlaceCircle.createId(shape));
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.placeShape !== nextProps.placeShape;
  },

  render: function() {
    var shape = this.props.placeShape;

    return <g className="place-deco" strokeWidth={shape.strokeWidth} />;
  }
});