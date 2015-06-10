var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placesStore = require('../stores/places');

module.exports = React.createClass({
  componentDidMount: function() {
    var place = this.props.place;

    d3.select(React.findDOMNode(this))
      .attr('clip-path', 'url(#p' + place.id + ')');
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.place !== nextProps.place;
  },

  render: function() {
    var place = this.props.place;

    return <rect className="place-map" width="200" height="200" x={place.point.x - 100} y={place.point.y - 100} />;
  }
});