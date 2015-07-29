var Reflux = require('reflux'),
  Immutable = require('immutable'),
  d3 = require('d3'),
  debounce = require('mout/function/debounce');

var scalesStore = module.exports = Reflux.createStore({
  init: function() {
    this.scales = Immutable.Map();

    window.addEventListener('resize', debounce(this.updateScales.bind(this), 200));
    this.updateScales();
  },

  updateScales: function() {
    var scaleElements = document.querySelectorAll('[data-scale]');

    this.scales = this.scales.withMutations(function(scales) {
      for (var i = 0; i < scaleElements.length; i++) {
        var element = scaleElements.item(i),
          key = element.getAttribute('data-scale'),
          width = parseFloat(window.getComputedStyle(element).width),
          scale = scales.get(key);

        scale = scale == null ?
          d3.scale.linear().range([[0, 0], [0, 0]]) :
          scale.copy();

        var range = scale.range();

        if (element.hasAttribute('data-domain-min')) {
          if (element.hasAttribute('data-range-min'))
            range[0][0] = width;

          if (element.hasAttribute('data-range-max'))
            range[0][1] = width;
        }

        if (element.hasAttribute('data-domain-max')) {
          if (element.hasAttribute('data-range-min'))
            range[1][0] = width;

          if (element.hasAttribute('data-range-max')) {
            range[1][1] = width;
          }
        }

        scales.set(key, scale.range(range));
      }
    });

    this.trigger(this.createCopy());
  },

  getInitialState: function() {
    return this.createCopy();
  },

  createCopy: function() {
    return this.scales.map(function(scale) {
      return scale.copy();
    });
  }
});