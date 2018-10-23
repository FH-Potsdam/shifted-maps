import { useStaticRendering } from 'mobx-react';
import BaseApp, { AppComponentContext, Container } from 'next/app';
import Head from 'next/head';
import React from 'react';

import '../components/genericStyles';
import { ThemeProvider } from '../components/styled';
import theme from '../components/theme';
import config from '../config';
import { trimSlashesEnd } from '../utils/trimSlashes';

class App extends BaseApp {
  static async getInitialProps({ Component, ctx }: AppComponentContext) {
    let pageProps = {};

    if (ctx.req != null) {
      useStaticRendering(true);
    }

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Head>
          <title>Shifted Maps</title>
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
            content={`${trimSlashesEnd(config.url)}/static/images/shifted-maps-og.jpg`}
          />
          <meta property="twitter:title" content="Shifted Maps" />
          <meta
            property="twitter:description"
            content="Are there networks in maps? Shifted Maps visualizes personal movement data as a network of map extracts showing visited places. The geographic map dissolves and creates a flexible network layout, which reveals unique movement structures based on geographic positions, travel time or travel frequency."
          />
          <meta
            property="twitter:image"
            content={`${trimSlashesEnd(config.url)}/static/images/shifted-maps-og.jpg`}
          />
          <meta property="twitter:card" content="summary" />
          <meta name="viewport" content="width=device-width" />
          <link href="/static/images/favicon.ico" rel="shortcut icon" />
        </Head>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Container>
    );
  }
}

export default App;
