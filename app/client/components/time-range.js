import React, { Component } from 'react';
import moment from 'moment';

class TimeRange extends Component {
  render() {
    let { range } = this.props;

    return (
      <div className="time-range">
        <div className="time-range__start">
          <strong>{moment(range[0]).format('dddd')}</strong>
          {moment(range[0]).format('D. MMM YYYY')}
        </div>
        <div className="time-range__end">
          <strong>{moment(range[1]).format('dddd')}</strong>
          {moment(range[1]).format('D. MMM YYYY')}
        </div>
      </div>
    );
  }
}

export default TimeRange;