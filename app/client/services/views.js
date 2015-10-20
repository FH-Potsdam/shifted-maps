import { Map } from 'immutable';
import d3 from 'd3';
import _ from 'lodash';

function createNodeArray(places) {
  return places.map(function(place) {
    let { location } = place,
      x = location.lng + 180,
      y = location.lat + 90;

    return {
      place: place.id,
      x, y,
      start: { x, y }
    };
  }).toArray();
}

function createLinkArray(nodes, connections) {
  let findNode = function(place) {
    return _.find(nodes, { place });
  };

  return connections.map(function(connection) {
    return {
      connection: connection.id,
      source: findNode(connection.from),
      target: findNode(connection.to)
    }
  }).toArray();
}

function computeLocations(places, connections, linkDistance, done) {
  let nodes = createNodeArray(places),
    links = createLinkArray(nodes, connections);

  let force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([360, 180])
    .charge(-0.01)
    .chargeDistance(1)
    .gravity(0)
    .linkStrength(1)
    .linkDistance(function(link) {
      let distance = linkDistance(connections.get(link.connection));

      return distance;
    })
    .start();

  // Add small gravity for every node to its start position
  /*force.on('tick', function(event) {
    let { alpha } = event;

    nodes.forEach(function(node) {
      let x = node.start.x - node.x,
        y = node.start.y - node.y;

      node.x += x * alpha * .01;
      node.y += y * alpha * .01;
    });
  });*/

  force.on('end', function() {
    let locations = Map().withMutations(function(locations) {
      nodes.forEach(function(node) {
        locations.set(node.place, L.latLng(node.y - 90, node.x - 180));
      });
    });

    done(null, locations);
  });
}

export function geographicView(places, connections, done) {
  console.log('geographicView');

  function linkDistance(connection) {
    return connection.beeline;
  }

  computeLocations(places, connections, linkDistance, function(error, locations) {
    done(null, locations);
  });
}

export function durationView(places, connections, durationDomain, beelineRange, done) {
  console.log('durationView');

  let beelineScale = d3.scale.linear()
    .domain(durationDomain)
    .range(beelineRange)
    .clamp(true);

  function linkDistance(connection) {
    return beelineScale(connection.duration);
  }

  computeLocations(places, connections, linkDistance, function(error, locations) {
    done(null, locations);
  });
}

export function frequencyView(places, connections, frequencyDomain, beelineRange, done) {
  console.log('frequencyView');

  let beelineScale = d3.scale.linear()
    .domain([...frequencyDomain].reverse())
    .range(beelineRange)
    .clamp(true);

  function linkDistance(connection) {
    return beelineScale(connection.frequency);
  }

  computeLocations(places, connections, linkDistance, function(error, locations) {
    done(null, locations);
  });
}