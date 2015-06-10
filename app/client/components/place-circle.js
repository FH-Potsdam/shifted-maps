var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placesStore = require('../stores/places');

module.exports = React.createClass({
  componentDidMount: function() {
    var place = this.props.place;

    d3.select(React.findDOMNode(this))
      .append('clipPath')
      .attr('id', 'p' + place.id)
      .append('circle')
      .attr('cx', place.point.x)
      .attr('cy', place.point.y)
      .attr('r', place.radius);
  },

  componentDidUpdate: function() {
    var place = this.props.place;

    d3.select(React.findDOMNode(this))
      .select('circle')
      .attr('cx', place.point.x)
      .attr('cy', place.point.y)
      .attr('r', place.radius);
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.place !== nextProps.place;
  },

  render: function() {
    return (
      <g className="place-circle" />
    );
  }
});