var config = require('../../config/client.json'),
  d3 = require('d3');

// Format: [[MIN_ZOOM_MIN_RANGE, MIN_ZOOM_MAX_RANGE], [MAX_ZOOM_MIN_RANGE, MAX_ZOOM_MAX_RANGE]]
config.radius_scale = d3.scale.linear().range([[20, 75], [75, 250]]);
config.stroke_width_scale = d3.scale.linear().range([[1, 10], [4, 40]]);
config.zoom_scale = d3.scale.linear().range([[14, 16], [16, 18]]);

module.exports = config;