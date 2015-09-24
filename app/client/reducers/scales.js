import { Map } from 'immutable';
import { extend, each } from 'lodash';
import { scale } from 'd3';
import { UPDATE_SCALES } from '../actions';

export default function scales(state = Map(), action) {
  switch (action.type) {
    case UPDATE_SCALES:
      let scaleElements = action.elements;

      return state.withMutations(function(scales) {
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

    default:
      return state
  }
}