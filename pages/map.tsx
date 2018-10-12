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
}

class Map extends PureComponent<IProps> {
  static async getInitialProps({ req, query }: NextContext): Promise<IProps> {
    let view: VIEW | undefined;

    if (typeof query.view === 'string') {
      view = VIEW[query.view.toUpperCase()];
    }

    return {
      data: await fetchDemoDiary({ isServer: req != null }),
      view,
    };
  }

  handleFilterBarViewChange = (view?: VIEW) => {
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

  render() {
    const { data, view } = this.props;

    return (
      <Fragment>
        <DynamicVisualisation
          data={data}
          view={view}
          onFilterBarViewChange={this.handleFilterBarViewChange}
        />
      </Fragment>
    );
  }
}

export default Map;
