var Backbone = require('backbone'),
  d3 = require('d3'),
  Place = require('../models/place');

var VisView = Backbone.View.extend({
  initialize: function(options) {
    this._places = new Place.Collection();
    this._state = options.state;
    this._mapView = options.mapView;

    this.listenToOnce(this._places, 'sync', this.render);

    this._places.fetch();
  },

  render: function() {
    this._svg = d3.select(this.el).select('svg');
    this._placeRadiusScale = d3.scale.pow().exponent(.1).range([5, 50]);

    this.listenTo(this._mapView, 'zoomend', this.update);

    return this.update();
  },

  update: function() {
    var vis = this;

    var placeCircles = this._svg.selectAll('circle')
      .data(this._places.toJSON(), function(d) { return d._id; });

    placeCircles.enter()
      .append('circle');

    placeCircles
      .attr('r', function(d) {
        console.log(vis._placeRadiusScale(d.relativeDuration));
        return vis._placeRadiusScale(d.relativeDuration);
      })
      .attr('cx', function(d) {
        d.point = vis._state.placePoint(d);

        return d.point.x;
      })
      .attr('cy', function(d) {
        return d.point.y;
      });

    return this;
  }
});

module.exports = VisView;