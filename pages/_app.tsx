import { useStaticRendering } from 'mobx-react';
import BaseApp, { AppComponentContext, Container } from 'next/app';
import Head from 'next/head';
import React from 'react';

import '../components/genericStyles';
import { ThemeProvider } from '../components/styled';
import theme from '../components/theme';

class App extends BaseApp {
  public static async getInitialProps({ Component, ctx }: AppComponentContext) {
    let pageProps = {};

    if (ctx.req != null) {
      useStaticRendering(true);
    }

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  public render() {
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
