var React = require('react');

var PlaceCircle = module.exports = React.createClass({
  statics: {
    createId: function(node) {
      return 'place-circle-' + node.id;
    }
  },

  shouldComponentUpdate: function(nextProps) {
    var node = this.props.node;

    return node.point !== nextProps.node.point || node.radius !== nextProps.node.radius;
  },

  render: function() {
    var node = this.props.node,
      id = PlaceCircle.createId(node);

    return <circle className="place-circle" cx={node.point.x} cy={node.point.y} r={node.radius} id={id} />;
  }
});