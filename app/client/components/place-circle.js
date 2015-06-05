var Reflux = require('reflux'),
  React = require('react');

module.exports = React.createClass({
  render: function() {
    var place = this.props.place,
      center = place.radius / 2;

    return (
      <clipPath id={'place-' + place.id}>
        <circle cx={center} cy={center} r={place.radius} />
      </clipPath>
    );
  }
});