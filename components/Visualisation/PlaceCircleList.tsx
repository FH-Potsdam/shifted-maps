import { Component } from 'react';
import { observer, inject } from 'mobx-react';
/*import flow from 'lodash/fp/flow';
import flatten from 'lodash/fp/flatten';
import reverse from 'lodash/fp/reverse';*/

import PlaceCircle from './PlaceCircle';
import { Stores } from './Visualisation';
import PlaceCircleModel from '../../store/PlaceCircle';

type Props = {
  placeCircles?: PlaceCircleModel[];
};

@inject(
  ({ vis }: Stores): Partial<Props> => ({
    placeCircles: vis && vis.sortedPlaceCircles,
  })
)
@observer
class PlaceCircleList extends Component<Props> {
  render() {
    const { placeCircles } = this.props;

    if (placeCircles == null) {
      return null;
    }

    return (
      <g>
        {placeCircles.map(placeCircle => (
          <PlaceCircle key={placeCircle.key} placeCircle={placeCircle} />
        ))}
      </g>
    );
  }
}

export default PlaceCircleList;
