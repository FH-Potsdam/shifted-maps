import { PureComponent } from 'react';
import { scaleLinear, ScaleLinear } from 'd3';
import { DomUtil } from 'leaflet';

import styled from '../../styled';

type Props = {
  index: number;
  value: number;
  min: number;
  max: number;
  onChange: (index: number, value: number) => void;
  className?: string;
};

class Handle extends PureComponent<Props> {
  scale: ScaleLinear<number, number>;

  constructor(props: Props) {
    super(props);

    this.scale = scaleLinear()
      .range([0, 100])
      .clamp(true);
  }

  render() {
    const { className, value, min, max } = this.props;

    this.scale.domain([min, max]);

    const position = this.scale(value);
    const style = {
      left: `${position}%`,
      [DomUtil.TRANSFORM]: `translateX(${position * -1}%)`,
    };

    return <div className={className} style={style} />;
  }
}

export default styled(Handle)`
  position: absolute;
  top: 0;
  height: 5px;
  width: 5px;
  background-color: red;
  cursor: grab;

  &:after {
  }
`;
