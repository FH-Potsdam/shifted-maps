import BaseDocument, { Head, Main, NextDocumentContext, NextScript } from 'next/document';
import { ReactElement } from 'react';
import { ServerStyleSheet } from 'styled-components';

import config from '../config';
import { trimSlashesEnd } from '../utils/trimSlashes';

interface IProps {
  styleTags: Array<ReactElement<HTMLStyleElement>>;
}

class Document extends BaseDocument<IProps> {
  static getInitialProps({ renderPage }: NextDocumentContext) {
    const sheet = new ServerStyleSheet();
    const page = renderPage(App => props => sheet.collectStyles(<App {...props} />));
    const styleTags = sheet.getStyleElement();

    return { ...page, styleTags };
  }

  render() {
    return (
      <html>
        <Head>
          <title>Shifted Maps</title>
          <meta property="description" content="Visualizing networks in personal movement data" />
          <meta property="og:title" content="Shifted Maps" />
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
          {this.props.styleTags}
          <link href="/static/images/favicon.ico" rel="shortcut icon" />
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
