import { Map } from 'immutable';
import { extend, each } from 'lodash';
import d3 from 'd3';
import camelCase from 'mout/string/camelCase';
import { UPDATE_SCALES } from '../actions/scales';

function updateScales(state, action) {
  let { scaleElements, sizerElements } = action;

  return state.withMutations(function(scales) {
    for (let i = 0; i < scaleElements.length; i++) {
      let scaleElement = scaleElements.item(i),
        key = scaleElement.getAttribute('data-scale'),
        width = parseFloat(window.getComputedStyle(scaleElement).width);

      key = camelCase(key + '-range-scale');

      let scale = scales.get(key);

      scale = scale == null ?
        d3.scale.pow().exponent(2).range([[0, 0], [0, 0]]) :
        scale.copy();

      let range = scale.range();

      if (scaleElement.hasAttribute('data-domain-min')) {
        if (scaleElement.hasAttribute('data-range-min'))
          range[0][0] = width;

        if (scaleElement.hasAttribute('data-range-max'))
          range[0][1] = width;
      }

      if (scaleElement.hasAttribute('data-domain-max')) {
        if (scaleElement.hasAttribute('data-range-min'))
          range[1][0] = width;

        if (scaleElement.hasAttribute('data-range-max')) {
          range[1][1] = width;
        }
      }

      scales.set(key, scale.range(range));
    }

    for (let j = 0; j < sizerElements.length; j++) {
      let sizerElement = sizerElements.item(j),
        key = sizerElement.getAttribute('data-sizer'),
        width = parseFloat(window.getComputedStyle(sizerElement).width);

      scales.set(camelCase(key), width);
    }
  });
}

export default function scales(state = Map(), action) {
  switch (action.type) {
    case UPDATE_SCALES:
      return updateScales(state, action);

    default:
      return state
  }
}