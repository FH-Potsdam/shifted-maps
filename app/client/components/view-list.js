import React, { Component } from 'react';
import map from 'lodash/collection/map';
import classNames from 'classnames';
import { GEOGRAPHIC_VIEW, FREQUENCY_VIEW, DURATION_VIEW } from '../services/views';

const VIEWS = {
  [GEOGRAPHIC_VIEW]: 'geographic',
  [DURATION_VIEW]: 'duration',
  [FREQUENCY_VIEW]: 'frequency'
};

class ViewList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.activeView !== nextProps.activeView;
  }

  toggleView(view) {
    if (this.props.activeView === view)
      view = null;

    this.props.onViewChange(view);
  }

  render() {
    let { activeView } = this.props;

    let buttons = map(VIEWS, (key, view) => {
      let className = classNames('view-list__button', { active: activeView === view });

      let onClick = event => {
        event.preventDefault();
        this.toggleView(view)
      };

      return (
        <button className={className} key={view} onClick={onClick}>
          <i className={'icon icon--' + key} />
        </button>
      )
    });

    return (
      <div className="view-list">
        {buttons}
      </div>
    );
  }
}

export default ViewList;