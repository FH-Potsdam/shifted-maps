const withTypescript = require('@zeit/next-typescript');
const withCSS = require('@zeit/next-css');
const webpack = require('webpack');
const flow = require('lodash/fp/flow');

const package = require('./package');

module.exports = flow(
  withTypescript,
  withCSS
)({
  target: 'serverless',
  env: {
    url: process.env.NOW_URL || process.env.URL,
    mapboxAccessToken: 'pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw',
    mapboxStyleId: 'heike.6bac2bcd',
    version: package.version,
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            ref: true,
          },
        },
      ],
    });

    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/));

    return config;
  },
});
