import { Component } from 'react';
import { observer } from 'mobx-react';

type Props = {
  size: number;
};

@observer
class PlaceCircleMap extends Component<Props> {
  render() {
    const { size } = this.props;

    return (
      <rect
        clipPath="url(#clip-path-circle)"
        fill="red"
        width={size}
        height={size}
        transform={`translate(${size * -0.5}, ${size * -0.5})`}
      />
    );
  }
}

export default PlaceCircleMap;
