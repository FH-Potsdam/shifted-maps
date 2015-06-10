var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  placesShapesStore = require('./place-shapes'),
  connectionsStore = require('./connections'),
  ConnectionShape = require('../models/connection-shape');

module.exports = Reflux.createStore({
  init: function() {
    this.connectionShapes = Immutable.Map();

    this.strokeWidthScale = d3.scale.pow().exponent(.25).range([1, 20]);

    this.placeShapes = null;

    this.listenTo(connectionsStore, this.setConnections);
    this.listenTo(placesShapesStore, this.setPlaceShapes);
  },

  setConnections: function(connections) {
    var minFrequency = Infinity,
      maxFrequency = -Infinity;

    connections.forEach(function(connection) {
      var frequency = connection.trips.size;

      minFrequency = Math.min(minFrequency, frequency);
      maxFrequency = Math.max(maxFrequency, frequency);
    });

    var placeStrokeWidthScale = this.strokeWidthScale.domain([minFrequency, maxFrequency]),
      placeShapes = this.placeShapes;

    this.connectionShapes = connections.map(function(connection) {
      var to = placeShapes.get(connection.to),
        from = placeShapes.get(connection.from);

      return new ConnectionShape({
        to: to != null ? to.point : null,
        from: from != null ? from.point : null,
        strokeWidth: placeStrokeWidthScale(connection.trips.size),
        connection: connection
      });
    });

    this.trigger(this.connectionShapes);
  },

  setPlaceShapes: function(placeShapes) {
    this.placeShapes = placeShapes;

    this.connectionShapes = this.connectionShapes.map(function(connectionShape) {
      var connection = connectionShape.connection,
        to = placeShapes.get(connection.to),
        from = placeShapes.get(connection.from);

      return connectionShape.merge({
        to: to != null ? to.point : null,
        from: from != null ? from.point : null
      });
    });

    this.trigger(this.connectionShapes);
  },

  getInitialState: function() {
    return this.connectionShapes;
  }
});