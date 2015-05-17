function State(options) {
  this._map = options.map;
}

State.prototype.placePoint = function(place) {
  var location = place.location,
    latLng = L.latLng(location.latitude, location.longitude);

  return this._map.latLngToLayerPoint(latLng);
};

module.exports = State;