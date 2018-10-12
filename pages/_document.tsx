import { ReactElement } from 'react';
import BaseDocument, {
  Head,
  Main,
  NextScript,
  NextDocumentContext,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';

type Props = {
  styleTags: ReactElement<HTMLStyleElement>[];
};

class Document extends BaseDocument<Props> {
  static getInitialProps({ renderPage }: NextDocumentContext) {
    const sheet = new ServerStyleSheet();
    const page = renderPage(App => props =>
      sheet.collectStyles(<App {...props} />)
    );
    const styleTags = sheet.getStyleElement();

    return { ...page, styleTags };
  }

  render() {
    return (
      <html>
        <Head>
          <meta name="description" content="Shifted Maps" />
          <meta
            name="author"
            content="Lennart Hildebrandt &amp; Heike Otten (University of Applied Sciences Potsdam)"
          />
          <meta name="viewport" content="width=device-width" />
          {this.props.styleTags}
          <link
            href="/static/images/favicon.ico"
            rel="shortcut icon"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default Document;
