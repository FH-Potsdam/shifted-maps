import { Map } from 'immutable';
import { extend, each } from 'lodash';
import d3 from 'd3';
import camelCase from 'mout/string/camelCase';
import { UPDATE_SCALES } from '../actions/scales';

function computeRangeScaleKey(key) {
  return camelCase(key) + 'RangeScale';
}

export default function scales(state = Map(), action) {
  switch (action.type) {
    case UPDATE_SCALES:
      let scaleElements = action.elements;

      return state.withMutations(function(scales) {
        for (let i = 0; i < scaleElements.length; i++) {
          let element = scaleElements.item(i),
            key = element.getAttribute('data-scale'),
            width = parseFloat(window.getComputedStyle(element).width);

          key = computeRangeScaleKey(key);

          let scale = scales.get(key);

          scale = scale == null ?
            d3.scale.linear().range([[0, 0], [0, 0]]) :
            scale.copy();

          let range = scale.range();

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

    default:
      return state
  }
}