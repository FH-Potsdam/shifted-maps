import { NextContext } from 'next';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { Fragment, PureComponent } from 'react';

import { DiaryData, fetchDemoDiary } from '../stores/Diary';
import { VIEW } from '../stores/UIStore';

const DynamicVisualisation = dynamic({
  loader: () => import('../components/Visualisation/Visualisation').then(module => module.default),
  loading: () => null,
  ssr: false,
});

interface IProps {
  data: DiaryData;
  view?: VIEW;
  timeSpan?: ReadonlyArray<number>;
}

class Map extends PureComponent<IProps> {
  static async getInitialProps({ req, query }: NextContext): Promise<IProps> {
    let timeSpan: ReadonlyArray<number> | undefined;
    let view: VIEW | undefined;

    if (typeof query.timeSpan === 'string') {
      const timeSpanStrings = query.timeSpan.split('-');

      if (timeSpanStrings.length === 2) {
        timeSpan = timeSpanStrings.map(timeSpanString => +timeSpanString);
      }
    }

    if (typeof query.view === 'string') {
      view = VIEW[query.view.toUpperCase()];
    }

    return {
      data: await fetchDemoDiary({ isServer: req != null }),
      timeSpan,
      view,
    };
  }

  handleViewChange = (view?: VIEW) => {
    const query: { view?: string } = {
      ...Router.query,
    };

    if (view != null) {
      query.view = VIEW[view].toLowerCase();
    } else {
      delete query.view;
    }

    Router.push({ pathname: '/map', query });
  };

  handleTimeSpanChange = (timeSpan: ReadonlyArray<number>) => {
    const query = {
      ...Router.query,
      timeSpan: timeSpan.join('-'),
    };

    Router.push({ pathname: '/map', query });
  };

  render() {
    const { data, view, timeSpan } = this.props;

    return (
      <Fragment>
        <DynamicVisualisation
          data={data}
          view={view}
          timeSpan={timeSpan}
          onViewChange={this.handleViewChange}
          onTimeSpanChange={this.handleTimeSpanChange}
        />
      </Fragment>
    );
  }
}

export default Map;
