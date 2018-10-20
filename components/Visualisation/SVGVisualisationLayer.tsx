import { observer } from 'mobx-react';
import { Component } from 'react';

import VisualisationStore from '../../stores/VisualisationStore';
import SVGLayer from './SVGLayer';
import VisualisationElements from './VisualisationElementList';

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

    return (
      <SVGLayer>
        <defs>
          <clipPath id="clip-path-circle" clipPathUnits="objectBoundingBox">
            <circle r="0.5" cx="0.5" cy="0.5" />
          </clipPath>
        </defs>
        <VisualisationElements vis={vis} />
      </SVGLayer>
    );
  }
}

export default SVGVisualisationLayer;
