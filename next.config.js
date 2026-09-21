const package = require('./package');

module.exports = {
  compiler: {
    styledComponents: true,
  },
  env: {
    url: process.env.URL,
    mapboxAccessToken: 'pk.eyJ1IjoibGVubmVyZCIsImEiOiJXRjB3WGswIn0.3plnt32h0h8pfb9aZ_oGyw',
    mapboxStaticStyleId: 'mapbox/streets-v11',
    version: package.version,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              ref: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
};
