import { IncomingMessage } from 'http';
import { useStaticRendering } from 'mobx-react';
import BaseApp, { AppContext } from 'next/app';
import Head from 'next/head';
import 'normalize.css';
import React, { Fragment } from 'react';

import GlobalStyle from '../components/GlobalStyle';
import { ThemeProvider } from '../components/styled';
import theme from '../components/theme';
import '../styles/fonts.css';
import { trimSlashesEnd } from '../utils/trimSlashes';

interface IProps {
  url: string;
}

function getAbsoluteURL(req: IncomingMessage | undefined) {
  const host =
    req != null ? (req.headers['x-forwarded-host'] as string | undefined) : window.location.host;

  if (host == null) {
    if (process.env.url == null) {
      throw new Error('Not able to get absolute URL.');
    }

    return process.env.url;
  }

  const protocol = host.indexOf('localhost') > -1 ? 'http' : 'https';

  return `${protocol}://${host}`;
}

class App extends BaseApp<IProps> {
  static async getInitialProps({ Component, ctx }: AppContext) {
    let pageProps = {};

    if (ctx.req != null) {
      useStaticRendering(true);
    }

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps, url: getAbsoluteURL(ctx.req) };
  }

  render() {
    const { Component, pageProps, url } = this.props;

    return (
      <>
        <Head>
          <title>Shifted Maps</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <meta content="follow index" name="robots" />
          <meta property="description" content="Visualizing networks in personal movement data" />
          <meta property="og:title" content="Shifted Maps" />
          <meta property="og:site_name" content="Shifted Maps" />
          <meta
            property="og:author"
            content="Heike Otten, Lennart Hildebrandt, Till Nagel, Marian Dörk, Boris Müller"
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:description"
            content="Are there networks in maps? Shifted Maps visualizes personal movement data as a network of map extracts showing visited places. The geographic map dissolves and creates a flexible network layout, which reveals unique movement structures based on geographic positions, travel time or travel frequency."
          />
          <meta
            property="og:image"
            content={`${trimSlashesEnd(url)}/static/images/shifted-maps-og.jpg`}
          />
          <meta property="twitter:title" content="Shifted Maps" />
          <meta
            property="twitter:description"
            content="Are there networks in maps? Shifted Maps visualizes personal movement data as a network of map extracts showing visited places. The geographic map dissolves and creates a flexible network layout, which reveals unique movement structures based on geographic positions, travel time or travel frequency."
          />
          <meta
            property="twitter:image"
            content={`${trimSlashesEnd(url)}/static/images/shifted-maps-og.jpg`}
          />
          <meta property="twitter:card" content="summary" />
          <link href="/static/images/favicon.ico" rel="shortcut icon" />
        </Head>
        <ThemeProvider theme={theme}>
          <Fragment>
            <Component {...pageProps} />
            <GlobalStyle />
          </Fragment>
        </ThemeProvider>
      </>
    );
  }
}

export default App;
