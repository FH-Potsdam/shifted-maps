var Reflux = require('reflux'),
  React = require('react'),
  d3 = require('d3'),
  connectionsStore = require('../stores/connections');

module.exports = React.createClass({
  mixins: [Reflux.connect(connectionsStore, 'connections')],

  componentDidMount: function() {
    this.updateVisualization();
  },

  componentDidUpdate: function() {
    this.updateVisualization();
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return this.state.connections !== nextState.connections;
  },

  updateVisualization: function() {
    var parent = d3.select(React.findDOMNode(this)),
      connections = this.state.connections.toArray();

    connections = connections.filter(function(connection) {
      return connection.from.point != null && connection.to.point != null;
    });

    var connectionLines = parent.selectAll('.connection')
      .data(connections);

    connectionLines
      .enter()
      .append('line')
      .attr('class', 'connection');

    connectionLines
      .attr('x1', function(d) { return d.from.point.x; })
      .attr('y1', function(d) { return d.from.point.y; })
      .attr('x2', function(d) { return d.to.point.x; })
      .attr('y2', function(d) { return d.to.point.y; });
  },

  render: function() {
    return (
      <g className="connections"></g>
    );
  }
});