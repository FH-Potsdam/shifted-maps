var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placesStore = require('../stores/places');

module.exports = React.createClass({
  componentDidMount: function() {
    var shape = this.props.placeShape;

    d3.select(React.findDOMNode(this))
      .attr('clip-path', 'url(#p' + shape.id + ')');
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.placeShape !== nextProps.placeShape;
  },

  render: function() {
    var shape = this.props.placeShape;

    return <rect className="place-map" width="200" height="200" x={shape.point.x - 100} y={shape.point.y - 100} />;
  }
});