var oboe = require('oboe'),
  url = require('url'),
  geolib = require('geolib'),
  config = require('../config'),
  clientConfig = require('../../client/config'),
  cache = require('./cache');

var geocodeCache = cache('geocode', {
  ttl: 60 * 60 * 24 * 30 // 30 days, see Mapbox terms (https://www.mapbox.com/tos/)
});

function geocode(location, callback) {
  var lonLat = [geolib.longitude(location), geolib.latitude(location)].join(',');

  // Function for requesting a reversed geocode location if we have no cache entry
  function requestApi() {
    var apiURLObject = url.parse(config.mapbox.api_url, true),
      path = ['geocode', config.mapbox.geocoding_index];

    path.push(lonLat);

    apiURLObject.pathname += '/' + path.join('/') + '.json';
    apiURLObject.query.access_token = clientConfig.mapbox.token;

    var options = {
      url: url.format(apiURLObject),
      gzip: true
    };

    oboe(options)
      .node('place_name', function(placeName) {
        this.abort();

        geocodeCache.set(lonLat, placeName, function(error) {
          callback(error, placeName);
        });
      })
      .fail(function(error) {
        callback(error);
      });
  }

  geocodeCache.get(lonLat, function(error, value) {
    if (error)
      return callback(error);

    if (value == null)
      return requestApi();

    callback(null, value);
  });
}

module.exports = geocode;