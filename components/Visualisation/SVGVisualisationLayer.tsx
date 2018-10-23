import { observer } from 'mobx-react';
import { Component } from 'react';

import VisualisationStore from '../../stores/VisualisationStore';
import SVGLayer from './SVGLayer';
import { DEVICE } from './Visualisation';
import VisualisationElementList from './VisualisationElementList';

interface IProps {
  vis: VisualisationStore;
  touch: boolean;
  device: DEVICE;
}

@observer
class SVGVisualisationLayer extends Component<IProps> {
  render() {
    const { vis, touch, device } = this.props;

    if (!vis.ready) {
      return null;
    }

    return (
      <SVGLayer>
        <VisualisationElementList vis={vis} touch={touch} device={device} />
      </SVGLayer>
    );
  }
}

export default SVGVisualisationLayer;
