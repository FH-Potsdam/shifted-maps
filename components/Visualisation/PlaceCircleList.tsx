import { Component } from 'react';
import { observer } from 'mobx-react';

import PlaceCircle from './PlaceCircle';
import PlaceCircleModel from '../../stores/PlaceCircle';

type Props = {
  placeCircles: PlaceCircleModel[];
};

@observer
class PlaceCircleList extends Component<Props> {
  render() {
    const { placeCircles } = this.props;

    return (
      <g>
        {placeCircles.map(placeCircle => (
          <PlaceCircle
            key={placeCircle.key}
            placeCircle={placeCircle}
          />
        ))}
      </g>
    );
  }
}

export default PlaceCircleList;
