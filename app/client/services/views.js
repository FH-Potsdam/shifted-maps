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
  console.log('computeLocations');

  let nodes = createNodeArray(places),
    links = createLinkArray(nodes, connections);

  let force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([360, 180])
    .charge(0)
    .gravity(0)
    .linkDistance(function(link) {
      let distance = linkDistance(connections.get(link.connection))

      console.log(distance);

      return distance;
    })
    .start();

  // Add small gravity for every node to its start position
  force.on('tick', function(event) {
    let { alpha } = event;

    nodes.forEach(function(node) {
      let x = node.start.x - node.x,
        y = node.start.y - node.y;

      node.x += x * alpha;
      node.y += y * alpha;
    });
  });

  force.on('end', function() {
    let locations = {};

    nodes.forEach(function(node) {
      locations[node.place] = L.latLng(node.y - 90, node.x - 180);
    });

    done(null, locations);
  });
}

function view(map, places, connections, linkDistance, done) {
  console.log('view');

  computeLocations(places, connections, linkDistance, function(error, locations) {
    done(null, function(place) {
      let location = locations[place.id];

      return map.latLngToLayerPoint(location);
    });
  });
}

export function geographicView(map, done) {
  console.log('geographicView');

  done(null, function(place) {
    return map.latLngToLayerPoint(place.location);
  });
}

export function durationView(map, places, connections, durationDomain, beelineRange, done) {
  console.log('durationView');

  let beelineScale = d3.scale.linear()
    .domain(durationDomain)
    .range(beelineRange);

  function linkDistance(connection) {
    return beelineScale(connection.duration);
  }

  view(map, places, connections, linkDistance, done);
}

export function frequencyView(map, places, connections, frequencyDomain, beelineRange, done) {
  console.log('frequencyView');

  //console.log(frequencyDomain);

  let beelineScale = d3.scale.linear()
    .domain([...frequencyDomain].reverse())
    .range(beelineRange);

  function linkDistance(connection) {
    return beelineScale(connection.frequency);
  }

  view(map, places, connections, linkDistance, done);
}