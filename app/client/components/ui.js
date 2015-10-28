import React, { Component } from 'react';
import { Map } from 'immutable';
import debounce from 'mout/function/debounce';
import TimeSlider from './time-slider';
import TryOwnData from './try-own-data';
import TimeRange from './time-range';
import ViewList from './view-list';

class UI extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.ui !== nextProps.ui;
  }

  render() {
    let { ui } = this.props,
      timeSlider = null,
      timeRange = null,
      tryOwnData = null;

    if (ui.has('timeSpanRange')) {
      let onTimeSliderChange = debounce(this.props.onTimeSpanChange, 200),
        timeSpanRange = ui.get('timeSpanRange'),
        step = ui.get('timeSpanStep');

      // @TODO define default prop values and add disabled, active and focused states.
      timeSlider = <TimeSlider defaultValues={timeSpanRange} step={step} distance={step} onChange={onTimeSliderChange} />;
      timeRange = <TimeRange range={ui.get('timeSpan')} />
    }

    if (!ui.get('authorized'))
      tryOwnData = <TryOwnData />;

    // @TODO add disabled and active state
    let viewList = <ViewList activeView={ui.get('activeView')} onViewChange={this.props.onViewChange} />;

    return (
      <div className="ui">
        <h1>Shifted Maps</h1>
        <a href="/" className="ui__info"><i className="icon icon--info" /></a>
        {tryOwnData}
        {viewList}
        {timeSlider}
        {timeRange}
      </div>
    );
  }
}

export default UI;