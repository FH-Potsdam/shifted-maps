import { observer } from 'mobx-react';
import VisualisationStore from '../../stores/VisualisationStore';
import SVGLayer from './SVGLayer';
import { DEVICE } from './Visualisation';
import VisualisationElementList from './VisualisationElementList';

interface SVGVisualisationLayerProps {
  vis: VisualisationStore;
  touch: boolean;
  device: DEVICE;
}

const SVGVisualisationLayer = observer(({ vis, touch, device }: SVGVisualisationLayerProps) => {
  if (!vis.ready) {
    return null;
  }

  return (
    <SVGLayer>
      <VisualisationElementList vis={vis} touch={touch} device={device} />
    </SVGLayer>
  );
});

export default SVGVisualisationLayer;
