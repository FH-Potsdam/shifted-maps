var config = require('../../config/server.json');

config.moves.api_url = 'https://api.moves-app.com/api/1.1';
config.moves.oauth_url = 'https://api.moves-app.com/oauth/v1';
config.moves.authorization_url = config.moves.oauth_url + '/authorize';
config.moves.token_url = config.moves.oauth_url + '/access_token';
config.moves.token_info_url = config.moves.oauth_url + '/tokeninfo';

config.mapbox.api_url = 'http://api.tiles.mapbox.com/v4';

config.api = { place_limit: 100 };
config.session.store_ttl = 60 * 60 * 24;

module.exports = config;