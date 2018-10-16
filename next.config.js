const withTypescript = require('@zeit/next-typescript');
const withCSS = require('@zeit/next-css');
const webpack = require('webpack');
const flow = require('lodash/fp/flow');

module.exports = flow(
  withTypescript,
  withCSS
)({
  publicRuntimeConfig: {
    url: process.env.NOW_URL || process.env.URL,
    mapboxAccessToken: 'pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw',
    mapboxStyleId: 'heike.6bac2bcd',
  },
  webpack(config, options) {
    return {
      ...config,
      plugins: [
        ...config.plugins,
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
      ],
    };
  },
});
