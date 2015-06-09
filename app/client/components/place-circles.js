var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placesStore = require('../stores/places');

module.exports = React.createClass({
  mixins: [Reflux.connect(placesStore, 'places')],

  componentDidMount: function() {
    this.updateVisualization();
  },

  componentDidUpdate: function() {
    this.updateVisualization();
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.places !== nextState.places;
  },

  updateVisualization: function() {
    var parent = d3.select(React.findDOMNode(this)),
      places = this.state.places.toArray();

    var placeClipPaths = parent.selectAll('.place-circle')
      .data(places, function(d) { return d.id; });

    placeClipPaths
      .enter()
      .append('clipPath')
      .attr('class', 'place-circle')
      .append('circle');

    placeClipPaths
      .attr('id', function(d) { return 'p' + d.id; })
      .select('circle')
      .attr('cx', function(d) { return d.point.x; })
      .attr('cy', function(d) { return d.point.y; })
      .transition()
      .attr('r', function(d) { return d.radius; });
  },

  render: function() {
    return (
      <g className="place-circles"></g>
    );
  }
});