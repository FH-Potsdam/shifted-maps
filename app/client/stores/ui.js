var Reflux = require('reflux'),
  Immutable = require('immutable'),
  moment = require('moment'),
  initAction = require('../actions/init'),
  UiActions = require('../actions/ui');

module.exports = Reflux.createStore({
  init: function() {
    this.state = Immutable.Map({
      timeFilter: Immutable.Map()
    });

    this.listenTo(initAction.addStay, 'onAddStay');
    this.listenToMany(UiActions);
  },

  onAddStay: function(stay) {
    var timeFilter = this.state.get('timeFilter');

    if (timeFilter.isEmpty()) {
      timeFilter = {
        min: Infinity,
        max: -Infinity,
        start: Infinity,
        end: -Infinity,
        modified: false
      };
    } else {
      timeFilter = timeFilter.toJS();
    }

    var min = Math.min(stay.startAt, timeFilter.min),
      max = Math.max(stay.endAt, timeFilter.max);

    timeFilter.min = +moment(min).startOf('day');
    timeFilter.max = +moment(max).endOf('day');

    if (!timeFilter.modified) {
      timeFilter.start = timeFilter.min;
      timeFilter.end = timeFilter.max;
    }

    this.state = this.state.mergeDeepIn(['timeFilter'], timeFilter);

    this.trigger(this.state);
  },

  onUpdateTimeFilter: function(values) {
    this.state = this.state.mergeDeepIn(['timeFilter'], {
      start: values[0],
      end: values[1],
      modified: true
    });

    this.trigger(this.state);
  },

  getInitialState: function() {
    return this.state;
  }
});