var React = require('react'),
  ReactSlider = require('react-slider'),
  Reflux = require('reflux'),
  moment = require('moment'),
  uiStore = require('../stores/ui'),
  UiActions = require('../actions/ui');

var TIME_HANDLE_FORMAT = 'dddd, MMMM Do YYYY';

module.exports = React.createClass({
  mixins: [Reflux.connect(uiStore, 'ui')],

  onChange: function(values) {
    UiActions.updateTimeFilter(values);
  },

  render: function() {
    var timeFilter = this.state.ui.get('timeFilter');

    if (timeFilter == null)
      return null;

    var start = moment(timeFilter.get('start')),
      end = moment(timeFilter.get('end')),
      min = moment(timeFilter.get('min')),
      max = moment(timeFilter.get('max')),
      step = 60 * 60 * 24;

    return (
      <ReactSlider
        className="time-slider"
        handleClassName="time-slider-handle"
        barClassName="time-slider-bar"
        value={[+start, +end]}
        min={+min} max={+max}
        step={step}
        minDinstance={step}
        onChange={this.onChange}
        withBars>
        <div className="time-slider-handle-time">{start.format(TIME_HANDLE_FORMAT)}</div>
        <div className="time-slider-handle-time">{end.format(TIME_HANDLE_FORMAT)}</div>
      </ReactSlider>
    );
  }
});