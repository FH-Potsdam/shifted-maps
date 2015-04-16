var request = require('request'),
  url = require('url'),
  geolib = require('geolib'),
  config = require('../config'),
  clientConfig = require('../../client/config');

function geocode(location, callback) {
  var apiURLObject = url.parse(config.mapbox.api_url, true),
    path = ['geocode', config.mapbox.geocoding_index],
    lonLat = [geolib.longitude(location), geolib.latitude(location)].join(',');

  path.push(lonLat);

  apiURLObject.pathname += '/' + path.join('/') + '.json';
  apiURLObject.query.access_token = clientConfig.mapbox.token;

  return request({
    url: url.format(apiURLObject),
    gzip: true,
    json: true
  }, callback);
}

module.exports = geocode;