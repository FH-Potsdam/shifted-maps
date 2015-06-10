var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  placesStore = require('../stores/places'),
  PlaceMap = require('./place-map');

module.exports = React.createClass({
  mixins: [Reflux.connect(placesStore, 'places')],

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.places !== nextState.places;
  },

  render: function() {
    return (
      <g className="place-map-list">
        {this.state.places.map(function(place, key) {
          return <PlaceMap key={key} place={place} />;
        })}
      </g>
    );
  }
});