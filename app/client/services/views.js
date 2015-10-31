import { Map } from 'immutable';
import d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import currencyFormat from 'mout/number/currencyFormat';

function createNodeArray(places) {
  var lastPlace = places.last();

  return places.map(function(place) {
    let { location } = place,
      x = location.lng + 180,
      y = location.lat + 90;

    return {
      place: place.id,
      x, y,
      start: { x, y },
      fixed: place === lastPlace
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

function computeLocations(places, connections, linkStrength, linkDistance, done) {
  let nodes = createNodeArray(places),
    links = createLinkArray(nodes, connections);

  let force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([360, 180])
    .charge(-0.01)
    .chargeDistance(1)
    .gravity(0)
    .linkStrength(function(link) {
      return linkStrength(connections.get(link.connection));
    })
    .linkDistance(function(link) {
      return linkDistance(connections.get(link.connection));
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

export function geographicView(places, connections, distanceDomain, beelineRange, done) {
  console.log('geographicView');

  let strengthScale = d3.scale.linear()
    .domain(distanceDomain)
    .range([1, 0.5])
    .clamp(true);

  let distanceScale = d3.scale.linear()
    .domain(distanceDomain)
    .range(beelineRange)
    .clamp(true);

  function linkStrength(connection) {
    return strengthScale(connection.distance);
  }

  function linkDistance(connection) {
    return distanceScale(connection.distance);
  }

  computeLocations(places, connections, linkStrength, linkDistance, function(error, locations) {
    done(null, locations);
  });
}

export function durationView(places, connections, durationDomain, beelineRange, done) {
  console.log('durationView');

  let strengthScale = d3.scale.linear()
    .domain(durationDomain)
    .range([1, 0.5])
    .clamp(true);

  let distanceScale = d3.scale.linear()
    .domain(durationDomain)
    .range(beelineRange)
    .clamp(true);

  function linkStrength(connection) {
    return strengthScale(connection.duration);
  }

  function linkDistance(connection) {
    return distanceScale(connection.duration);
  }

  computeLocations(places, connections, linkStrength, linkDistance, function(error, locations) {
    done(null, locations);
  });
}

export function frequencyView(places, connections, frequencyDomain, beelineRange, done) {
  console.log('frequencyView');

  let strengthScale = d3.scale.linear()
    .domain(frequencyDomain)
    .range([0.1, 1])
    .clamp(true);

  let distanceScale = d3.scale.linear()
    .domain([...frequencyDomain].reverse())
    .range(beelineRange)
    .clamp(true);

  function linkStrength(connection) {
    return strengthScale(connection.frequency);
  }

  function linkDistance(connection) {
    return distanceScale(connection.frequency);
  }

  computeLocations(places, connections, linkStrength, linkDistance, function(error, locations) {
    done(null, locations);
  });
}

export function formatDistance(distance) {
  if (distance >= 1000)
    distance = currencyFormat(Math.round(distance / 1000), 0) + ' km';
  else
    distance += ' m';

  return distance;
}

export function geographicLabel(connection) {
  return formatDistance(connection.distance);
}

export function formatDuration(duration) {
  return moment.duration(duration, 'seconds').humanize();
}

export function durationLabel(connection) {
  return formatDuration(connection.duration);
}

export function formatFrequency(frequency) {
  return Math.round(frequency * 100) / 100 + ' ×';
}

export function frequencyLabel(connection) {
  return formatFrequency(connection.frequency);
}