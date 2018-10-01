import React from 'react';
import BaseApp, { Container, AppComponentContext } from 'next/app';
import dynamic from 'next/dynamic';

import { ThemeProvider } from '../components/styled';
import theme from '../components/theme';
import '../components/genericStyles';

const DynamicWebFont = dynamic(
  import('../components/common/WebFont').then(module => module.default),
  { ssr: false }
);

class App extends BaseApp {
  static async getInitialProps({ Component, ctx }: AppComponentContext) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
        <DynamicWebFont />
      </Container>
    );
  }
}

export default App;
