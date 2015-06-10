var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placeShapesStore = require('../stores/place-shapes'),
  PlaceMap = require('./place-map');

module.exports = React.createClass({
  mixins: [Reflux.connect(placeShapesStore, 'placeShapes')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.placeShapes !== nextState.placeShapes;
  },

  render: function() {
    return (
      <g className="place-map-list">
        {this.state.placeShapes.map(function(placeShape, key) {
          return <PlaceMap key={key} placeShape={placeShape} />;
        })}
      </g>
    );
  }
});