import { observer } from 'mobx-react';
import { Component } from 'react';

import ConnectionLineModel from '../../stores/ConnectionLine';
import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import ConnectionLine from './ConnectionLine';
import PlaceCircle from './PlaceCircle';

interface IProps {
  vis: VisualisationStore;
  touch: boolean;
}

@observer
class VisualisationElementList extends Component<IProps> {
  render() {
    const { vis, touch } = this.props;
    const { elements } = vis;

    return (
      <g>
        {elements.map(element => {
          if (element instanceof PlaceCircleModel) {
            return <PlaceCircle key={element.key} placeCircle={element} vis={vis} touch={touch} />;
          }

          if (element instanceof ConnectionLineModel) {
            return (
              <ConnectionLine key={element.key} connectionLine={element} vis={vis} touch={touch} />
            );
          }

          throw new Error('Unknown element.');
        })}
      </g>
    );
  }
}

export default VisualisationElementList;
