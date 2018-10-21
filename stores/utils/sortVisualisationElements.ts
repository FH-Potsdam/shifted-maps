import ConnectionLine from '../ConnectionLine';
import PlaceCircle from '../PlaceCircle';
import { VisualisationElement } from '../VisualisationStore';

function sortVisualisationElements(elements: VisualisationElement[]): VisualisationElement[] {
  return [...elements].sort((a, b) => {
    if (a.highlight !== b.highlight) {
      return Number(a.highlight) - Number(b.highlight);
    }

    if (a instanceof PlaceCircle && b instanceof PlaceCircle) {
      if (a.hover !== b.hover) {
        return Number(a.hover) - Number(b.hover);
      }

      return a.radius - b.radius;
    }

    if (a instanceof ConnectionLine && b instanceof ConnectionLine) {
      return a.strokeWidth - b.strokeWidth;
    }

    return a instanceof PlaceCircle ? 1 : -1;
  });
}

export default sortVisualisationElements;
