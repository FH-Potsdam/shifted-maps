var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placesStore = require('../stores/places');

module.exports = React.createClass({
  componentDidMount: function() {
    var shape = this.props.placeShape;

    d3.select(React.findDOMNode(this))
      .append('clipPath')
      .attr('id', 'p' + shape.id)
      .append('circle')
      .attr('cx', shape.point.x)
      .attr('cy', shape.point.y)
      .attr('r', shape.radius);
  },

  componentDidUpdate: function() {
    var shape = this.props.placeShape;

    d3.select(React.findDOMNode(this))
      .select('circle')
      .attr('cx', shape.point.x)
      .attr('cy', shape.point.y)
      .attr('r', shape.radius);
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.placeShape !== nextProps.placeShape;
  },

  render: function() {
    return (
      <g className="place-circle" />
    );
  }
});