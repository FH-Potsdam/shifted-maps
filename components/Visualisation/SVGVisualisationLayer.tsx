import { observer } from 'mobx-react';
import { Component } from 'react';

import VisualisationStore from '../../stores/VisualisationStore';
import SVGLayer from './SVGLayer';
import VisualisationElementList from './VisualisationElementList';

interface IProps {
  vis: VisualisationStore;
  touch: boolean;
}

@observer
class SVGVisualisationLayer extends Component<IProps> {
  render() {
    const { vis, touch } = this.props;

    if (!vis.ready) {
      return null;
    }

    return (
      <SVGLayer>
        <VisualisationElementList vis={vis} touch={touch} />
      </SVGLayer>
    );
  }
}

export default SVGVisualisationLayer;
