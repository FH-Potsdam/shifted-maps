var Reflux = require('reflux'),
  React = require('react'),
  placeShapesStore = require('../stores/place-shapes'),
  PlaceClip = require('./place-clip');

module.exports = React.createClass({
  mixins: [Reflux.connect(placeShapesStore, 'placeShapes')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.placeShapes !== nextState.placeShapes;
  },

  render: function() {
    return (
      <g className="place-clip-list">
        {this.state.placeShapes.map(function(placeShapes, key) {
          return <PlaceClip key={key} placeShape={placeShapes} />;
        })}
      </g>
    );
  }
});