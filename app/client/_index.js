var map = require('./vis/map'),
  svg = require('./vis/svg');

// Data
var places = [
  {id: "lennart", lat: 52.475920, lng: 13.430980},
  {id: "lynn", lat: 52.545000, lng: 13.431410}
];

map.fitBounds(L.latLngBounds(places));

var container = svg.append("g");

var placeCircles = container
  .selectAll("circle")
  .data(places, function(d) { return d.id; })
  .enter()
  .append("circle")
  .attr("r", 20);

function update() {
  placeCircles
    .each(function(d) {
      d.point = map.latLngToLayerPoint({lat: d.lat, lng: d.lng});
    })
    .attr("cx", function(d) {
      return d.point.x;
    })
    .attr("cy", function(d) {
      return d.point.y;
    });
}

map.on("viewreset", update);
update();