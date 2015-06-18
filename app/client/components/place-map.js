var Reflux = require('reflux'),
  React = require('react'),
  PlaceClip = require('./place-clip'),
  config = require('../config');

module.exports = React.createClass({
  componentDidMount: function() {
    d3.select(React.findDOMNode(this))
      .append('image')
      .attr('width', 500)
      .attr('height', 500);

    this.componentDidUpdate();
  },

  shouldComponentUpdate: function(nextProps) {
    var node = this.props.node;
    return nextProps.primary && (node.point !== nextProps.node.point || node.zoom !== nextProps.node.zoom);
  },

  componentDidUpdate: function() {
    var node = this.props.node,
      location = node.place.location,
      mapImage = 'http://api.tiles.mapbox.com/v4/' + config.mapbox.id +
        '/' + location.lng + ',' + location.lat + ',' + node.zoom + '/' +
        '500x500' + (L.Browser.retina ? '@2x' : '')  + '.png?access_token=' + config.mapbox.token;

    d3.select(React.findDOMNode(this))
      .select('image')
      //.attr('xlink:href', mapImage)
      .attr('x', node.point.x - 250)
      .attr('y', node.point.y - 250);
  },

  render: function() {
    var node = this.props.node,
      clipPath = 'url(#' + PlaceClip.createId(node) + ')';

    return (
      <g className="place-map" clipPath={clipPath} />
    );
  }
});