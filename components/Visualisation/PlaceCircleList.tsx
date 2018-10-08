import { Component } from 'react';
import { observer } from 'mobx-react';
import reverse from 'lodash/fp/reverse';

import PlaceCircle from './PlaceCircle';
import PlaceCircleModel from '../../store/PlaceCircle';

type Props = {
  placeCircles: PlaceCircleModel[];
  animate: boolean;
};

@observer
class PlaceCircleList extends Component<Props> {
  render() {
    const { placeCircles, animate } = this.props;

    return (
      <g>
        {reverse(placeCircles).map(placeCircle => (
          <PlaceCircle key={placeCircle.key} placeCircle={placeCircle} animate={animate} />
        ))}
      </g>
    );
  }
}

export default PlaceCircleList;
