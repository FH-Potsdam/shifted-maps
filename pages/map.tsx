import { PureComponent, Fragment } from 'react';
import { NextContext } from 'next';
import dynamic from 'next/dynamic';
import Router from 'next/router';

import { DiaryData, fetchDemoDiary } from '../store/Diary';
import { VIEW } from '../store/UIStore';

const DynamicVisualisation = dynamic({
  loader: () => import('../components/Visualisation/Visualisation').then(module => module.default),
  ssr: false,
  loading: () => null,
});

type Props = {
  data: DiaryData;
  view?: VIEW;
};

class Map extends PureComponent<Props> {
  static async getInitialProps({ req, query }: NextContext): Promise<Props> {
    let view: VIEW | undefined;

    if (typeof query.view === 'string') {
      view = VIEW[query.view.toUpperCase()];
    }

    return { data: await fetchDemoDiary({ isServer: req != null }), view };
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
