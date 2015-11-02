import React, { Component } from 'react';
import debounce from 'mout/function/debounce';
import TimeSlider from './time-slider';
import TimeRange from './time-range';
import Stats from './stats';
import ViewList from './view-list';

class UI extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.ui !== nextProps.ui;
  }

  render() {
    let { ui, stats } = this.props,
      timeSlider = null,
      timeRange = null;

    if (ui.has('timeSpanRange')) {
      let onTimeSliderChange = debounce(this.props.onTimeSpanChange, 200),
        timeSpanRange = ui.get('timeSpanRange'),
        step = ui.get('timeSpanStep');

      // @TODO define default prop values and add disabled, active and focused states.
      timeSlider = <TimeSlider defaultValues={timeSpanRange} step={step} distance={step} onChange={onTimeSliderChange} />;
      timeRange = <TimeRange range={ui.get('timeSpan')} />
    }

    let activeView = ui.get('activeView');

    // @TODO add disabled and active state when graph is calculated
    let viewList = <ViewList activeView={activeView} onViewChange={this.props.onViewChange} />;

    return (
      <div className="ui">
        <h1>Shifted Maps</h1>
        {/*<a href="/" className="ui__info"><i className="icon icon--info" /></a>*/}
        <Stats stats={stats} activeView={activeView}/>
        {viewList}
        {timeSlider}
        {timeRange}
      </div>
    );
  }
}

export default UI;