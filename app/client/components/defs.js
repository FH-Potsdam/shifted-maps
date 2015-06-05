var Reflux = require('reflux'),
  React = require('react'),
  placesStore = require('../stores/places'),
  PlaceCircle = require('./place-circle');

module.exports = React.createClass({
  mixins: [Reflux.connect(placesStore, 'places')],

  render: function() {
    var places = this.state.places
      .sortBy(function(place) { return place.duration * -1; });

    return (
      <defs>
        {places.map(function(place, id) {
          return <PlaceCircle key={id} place={place} />;
        })}
      </defs>
    );
  }
});