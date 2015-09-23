import { Map } from 'immutable';
import { RESIZE_VIS } from '../actions';

export default function scales(state = Map(), action) {
  switch (action.type) {
    case RESIZE_VIS:
      let scaleElements = action.elements;

      //let scaleElements = document.querySelectorAll('[data-scale]');

      return state.withMutations(function(scales) {
        for (var i = 0; i < scaleElements.length; i++) {
          var element = scaleElements.item(i),
            key = element.getAttribute('data-scale'),
            width = parseFloat(window.getComputedStyle(element).width),
            scale = d3.scale.linear();

          var range = [[0, 0], [0, 0]];

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