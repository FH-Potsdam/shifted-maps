import { autorun, computed } from 'mobx';

import VisualisationStore from './VisualisationStore';

class GraphStore {
  readonly vis: VisualisationStore;

  constructor(vis: VisualisationStore) {
    this.vis = vis;

    /*autorun(() => {
      const { view } = this.vis.ui;

      if (view == null) {
        return;
      }

      console.log(this.nodes, this.links);
    });*/
  }

  @computed
  get nodes() {
    return this.vis.visiblePlaceCircles.map(({ key, mapPoint }) => ({
      key,
      x: mapPoint.x,
      y: mapPoint.y,
    }));
  }

  @computed
  get links() {
    return this.vis.visibleConnectionLines.map(({ from, to }) => ({
      source: from.key,
      target: to.key,
    }));
  }
}

export default GraphStore;
