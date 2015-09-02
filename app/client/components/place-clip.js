var React = require('react'),
  PlaceCircle = require('./place-circle');

var PlaceClip = module.exports = React.createClass({
  statics: {
    createId: function(node) {
      return 'place-clip-' + node.id;
    }
  },

  shouldComponentUpdate: function() {
    return false;
  },

  render: function() {
    var node = this.props.node;

    return (
      <g>
        <clipPath id={PlaceClip.createId(node)}>
          <use xlinkHref={'#' + PlaceCircle.createId(node)} />
        </clipPath>
      </g>
    );
  }
});