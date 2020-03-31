const webpack = require('webpack');
const package = require('./package');

module.exports = {
  target: 'serverless',
  env: {
    url: process.env.URL,
    mapboxAccessToken: 'pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw',
    mapboxStaticStyleId: 'mapbox/streets-v11',
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
};
