import React from 'react';
import BaseApp, { Container, AppComponentContext } from 'next/app';
import Head from 'next/head';
import { useStaticRendering } from 'mobx-react';

import { ThemeProvider } from '../components/styled';
import theme from '../components/theme';
import '../components/genericStyles';

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
        </Head>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Container>
    );
  }
}

export default App;
