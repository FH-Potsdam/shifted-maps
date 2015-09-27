import React, { Component } from 'react';
import { Map } from 'immutable';
import debounce from 'mout/function/debounce';
import TimeSlider from './time-slider';

class UI extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.ui !== nextProps.ui;
  }

  onTimeSliderChange(values) {
    this.props.onTimeSpanChange(values);
  }

  render() {
    let { ui } = this.props,
      timeSpanRange = ui.get('timeSpanRange'),
      timeSpan = ui.get('timeSpan'),
      timeSlider = null;

    if (timeSpanRange != null && timeSpan != null) {
      let onTimeSliderChange = debounce(this.onTimeSliderChange.bind(this), 200),
        step = ui.get('timeSpanStep'),
        [ start, end ] = timeSpanRange;

      timeSlider = <TimeSlider start={start} end={end} step={step} defaultValues={timeSpan} distance={step} onChange={onTimeSliderChange} />;
    }

    // @TODO define default prop values and add disabled, active and focused states.

    return (
      <div className="ui">
        {timeSlider}
      </div>
    );
  }
}

export default UI;