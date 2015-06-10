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

    var placeImages = parent.selectAll('.place-map')
      .data(places, function(d) { return d.id; });

    placeImages
      .enter()
      .append('rect')
      .attr('class', 'place-map')
      .attr('clip-path', function(d) { return 'url(#p' + d.id + ')'; });

    placeImages
      .attr('x', function(d) { return d.point.x - 100; })
      .attr('y', function(d) { return d.point.y - 100; })
      .attr('width', function(d) { return 200; })
      .attr('height', function(d) { return 200; });
  },

  render: function() {
    return (
      <g className="place-map-list"></g>
    );
  }
});