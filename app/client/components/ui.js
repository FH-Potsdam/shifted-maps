var React = require('react'),
  TimeSlider = require('./time-slider');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="app-ui">
        <TimeSlider />
      </div>
    );
  }
});