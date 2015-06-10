var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placeShapesStore = require('../stores/place-shapes'),
  PlaceCircle = require('./place-circle');

module.exports = React.createClass({
  mixins: [Reflux.connect(placeShapesStore, 'placeShapes')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.placeShapes !== nextState.placeShapes;
  },

  render: function() {
    return (
      <g>
        {this.state.placeShapes.map(function(placeShapes, key) {
          return <PlaceCircle key={key} placeShape={placeShapes} />;
        })}
      </g>
    );
  }
});