var Reflux = require('reflux'),
  React = require('react'),
  placeStore = require('../stores/places'),
  initAction = require('../actions/init');

module.exports = React.createClass({
  mixins: [Reflux.connect(placeStore, 'places')],

  componentDidMount: function() {
    initAction();
  },

  render: function() {
    console.log(this.state);

    return (
      <ul>
        {this.state.places.sortBy(function(place) { return place.name; }).map(function(place, key) {
          return <li key={key}>{place.name}</li>;
        })}
      </ul>
    );
  }
});