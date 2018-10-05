import React from 'react';
import BaseApp, { Container, AppComponentContext } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useStaticRendering } from 'mobx-react';

import { ThemeProvider } from '../components/styled';
import theme from '../components/theme';
import '../components/genericStyles';

const DynamicWebFont = dynamic({
  loader: () => import('../components/common/WebFont').then(module => module.default),
  ssr: false,
  loading: () => null,
});

class App extends BaseApp {
  static async getInitialProps({ Component, ctx }: AppComponentContext) {
    let pageProps = {};

    if (ctx.req) {
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
        <DynamicWebFont />
      </Container>
    );
  }
}

export default App;
