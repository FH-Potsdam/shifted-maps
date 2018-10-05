const withTypescript = require('@zeit/next-typescript');
const withCSS = require('@zeit/next-css');
const webpack = require('webpack');

module.exports = withTypescript(
  withCSS({
    publicRuntimeConfig: {
      url: process.env.NOW_URL || process.env.URL,
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
  })
);
