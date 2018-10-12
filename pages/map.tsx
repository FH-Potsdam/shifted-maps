import { NextContext } from 'next';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { Fragment, PureComponent } from 'react';

import { DiaryData, fetchDemoDiary } from '../stores/Diary';
import { VIEW } from '../stores/UIStore';

const DynamicVisualisation = dynamic({
  loader: () => import('../components/Visualisation/Visualisation').then(module => module.default),
  ssr: false,
  loading: () => null,
});

interface Props {
  data: DiaryData;
  view?: VIEW;
}

class Map extends PureComponent<Props> {
  public static async getInitialProps({ req, query }: NextContext): Promise<Props> {
    let view: VIEW | undefined;

    if (typeof query.view === 'string') {
      view = VIEW[query.view.toUpperCase()];
    }

    return {
      data: await fetchDemoDiary({ isServer: req != null }),
      view,
    };
  }

  public handleFilterBarViewChange = (view?: VIEW) => {
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

  public render() {
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
