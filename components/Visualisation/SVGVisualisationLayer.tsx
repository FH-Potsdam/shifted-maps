import { observer } from 'mobx-react';
import { Component } from 'react';

import VisualisationStore from '../../stores/VisualisationStore';
import ConnectionLineList from './ConnectionLineList';
import PlaceCircleList from './PlaceCircleList';
import SVGLayer from './SVGLayer';

interface IProps {
  vis: VisualisationStore;
}

@observer
class SVGVisualisationLayer extends Component<IProps> {
  render() {
    const { vis } = this.props;

    if (!vis.ready) {
      return null;
    }

    const { sortedConnectionLines, sortedPlaceCircles } = vis;

    return (
      <SVGLayer>
        <defs>
          <clipPath id="clip-path-circle" clipPathUnits="objectBoundingBox">
            <circle r="0.5" cx="0.5" cy="0.5" />
          </clipPath>
        </defs>
        <ConnectionLineList connectionLines={sortedConnectionLines} />
        <PlaceCircleList placeCircles={sortedPlaceCircles} />
      </SVGLayer>
    );
  }
}

export default SVGVisualisationLayer;
