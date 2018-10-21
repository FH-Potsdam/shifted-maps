import { observer } from 'mobx-react';
import { Component } from 'react';

import ConnectionLineModel from '../../stores/ConnectionLine';
import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import ConnectionLine from './ConnectionLine';
import PlaceCircle from './PlaceCircle';

interface IProps {
  vis: VisualisationStore;
}

@observer
class VisualisationElementList extends Component<IProps> {
  render() {
    const { elements, maxPlaceCircleRadius } = this.props.vis;

    return (
      <g>
        {elements.map(element => {
          if (element instanceof PlaceCircleModel) {
            return (
              <PlaceCircle
                key={element.key}
                placeCircle={element}
                maxRadius={maxPlaceCircleRadius}
              />
            );
          }

          if (element instanceof ConnectionLineModel) {
            return <ConnectionLine key={element.key} connectionLine={element} />;
          }

          throw new Error('Unknown element.');
        })}
      </g>
    );
  }
}

export default VisualisationElementList;
