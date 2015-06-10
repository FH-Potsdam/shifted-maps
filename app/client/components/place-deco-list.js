var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placeShapesStore = require('../stores/place-shapes'),
  PlaceDeco = require('./place-deco');

module.exports = React.createClass({
  mixins: [Reflux.connect(placeShapesStore, 'placeShapes')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.placeShapes !== nextState.placeShapes;
  },

  render: function() {
    return (
      <g className="place-deco-list">
        {this.state.placeShapes.map(function(placeShape, key) {
          return <PlaceDeco key={key} placeShape={placeShape} />;
        })}
      </g>
    );
  }
});