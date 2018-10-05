import { PureComponent, Fragment } from 'react';
import { NextContext } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { DiaryData, fetchDemoDiary } from '../store/Diary';

const DynamicVisualisation = dynamic({
  loader: () => import('../components/Visualisation/Visualisation').then(module => module.default),
  ssr: false,
  loading: () => null,
});

type Props = {
  data: DiaryData;
};

class Map extends PureComponent<Props> {
  static async getInitialProps({ req }: NextContext): Promise<Props> {
    return { data: await fetchDemoDiary({ isServer: req != null }) };
  }

  render() {
    const { data } = this.props;

    return (
      <Fragment>
        <Head>
          <link rel="stylesheet" href="//unpkg.com/leaflet/dist/leaflet.css" />
        </Head>
        <DynamicVisualisation data={data} />
      </Fragment>
    );
  }
}

export default Map;
