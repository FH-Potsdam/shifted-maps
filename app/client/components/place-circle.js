var React = require('react');

var PlaceCircle = module.exports = React.createClass({
  statics: {
    createId: function(placeShape) {
      return 'place-circle-' + placeShape.id;
    }
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.placeShape !== nextProps.placeShape;
  },

  render: function() {
    var shape = this.props.placeShape,
      id = PlaceCircle.createId(shape);

    return <circle className="place-circle" cx={shape.point.x} cy={shape.point.y} r={shape.radius} id={id} />;
  }
});