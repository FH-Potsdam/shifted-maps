var map = require('./map'),
  d3 = require('d3');

// Initialize SVG root element
map._initPathRoot();

module.exports = d3.select(map.getPanes().overlayPane).select("svg");