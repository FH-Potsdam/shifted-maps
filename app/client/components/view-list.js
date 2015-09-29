import React, { Component } from 'react';
import _ from 'lodash';
import { GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW } from '../models/views';

const VIEWS = {
  [GEOGRAPHIC_VIEW]: 'Location',
  [FREQUENCY_VIEW]: 'Frequency',
  [DURATION_VIEW]: 'Duration'
};

class ViewList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.activeView !== nextProps.activeView;
  }

  render() {
    let { activeView } = this.props;

    let buttons = _.map(VIEWS, (label, view) => {
      let className = 'view-list__button';

      if (activeView === view)
        className += ' active';

      let onClick = event => {
        event.preventDefault();
        this.props.onViewChange(view);
      };

      return <button className={className} key={view} onClick={onClick}>{label}</button>
    });

    return (
      <div className="view-list">
        {buttons}
      </div>
    );
  }
}

export default ViewList;