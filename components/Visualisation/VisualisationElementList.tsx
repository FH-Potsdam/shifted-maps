import { observer } from 'mobx-react';
import ConnectionLineModel from '../../stores/ConnectionLine';
import PlaceCircleModel from '../../stores/PlaceCircle';
import VisualisationStore from '../../stores/VisualisationStore';
import ConnectionLine from './ConnectionLine';
import PlaceCircle from './PlaceCircle';
import { DEVICE } from './Visualisation';

interface VisualisationElementListProps {
  vis: VisualisationStore;
  touch: boolean;
  device: DEVICE;
}

const VisualisationElementList = observer(({ vis, touch, device }: VisualisationElementListProps) => {
  const { elements } = vis;

  return (
    <g>
      {elements.map(element => {
        if (element instanceof PlaceCircleModel) {
          return <PlaceCircle key={element.key} placeCircle={element} vis={vis} touch={touch} device={device} />;
        }

        if (element instanceof ConnectionLineModel) {
          return <ConnectionLine key={element.key} connectionLine={element} vis={vis} touch={touch} device={device} />;
        }

        throw new Error('Unknown element.');
      })}
    </g>
  );
});

export default VisualisationElementList;
