import { observer } from 'mobx-react';
import { Component } from 'react';

import PlaceCircleModel from '../../stores/PlaceCircle';
import PlaceCircle from './PlaceCircle';

interface IProps {
  placeCircles: PlaceCircleModel[];
}

@observer
class PlaceCircleList extends Component<IProps> {
  render() {
    const { placeCircles } = this.props;

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
