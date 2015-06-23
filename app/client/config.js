var config = require('../../config/client.json'),
  d3 = require('d3');

// Format: [[MIN_ZOOM_MIN_RANGE, MIN_ZOOM_MAX_RANGE], [MAX_ZOOM_MIN_RANGE, MAX_ZOOM_MAX_RANGE]]
config.place_radius_scale = d3.scale.linear().range([[20, 75], [100, 250]]);
config.place_stroke_width_scale = d3.scale.linear().range([[1, 10], [4, 40]]);
config.edge_stroke_width_scale = d3.scale.linear().range([[.5, 2], [2, 15]]);

config.place_to_bounds_meters = 100;

module.exports = config;