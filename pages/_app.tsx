import { useStaticRendering } from 'mobx-react';
import BaseApp, { AppComponentContext, Container } from 'next/app';
import Head from 'next/head';
import 'normalize.css';
import React, { Fragment } from 'react';

import GlobalStyle from '../components/GlobalStyle';
import { ThemeProvider } from '../components/styled';
import theme from '../components/theme';
import { trimSlashesEnd } from '../utils/trimSlashes';

interface IProps {
  url: string;
}

class App extends BaseApp<IProps> {
  static async getInitialProps({ Component, ctx }: AppComponentContext) {
    let pageProps = {};

    if (ctx.req != null) {
      useStaticRendering(true);
    }

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    let url =
      ctx.req != null ? (ctx.req.headers['x-forwarded-host'] as string) : window.location.host;

    if (url == null) {
      if (process.env.url == null) {
        throw new Error('Not able to get absolute URL.');
      }

      url = process.env.url;
    }

    return { pageProps, url };
  }

  render() {
    const { Component, pageProps, url } = this.props;

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
          <meta name="viewport" content="width=device-width" />
          <link href="/static/images/favicon.ico" rel="shortcut icon" />
        </Head>
        <ThemeProvider theme={theme}>
          <Fragment>
            <Component {...pageProps} />
            <GlobalStyle />
          </Fragment>
        </ThemeProvider>
      </Container>
    );
  }
}

export default App;
