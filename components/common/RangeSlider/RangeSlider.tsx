import { PureComponent } from 'react';

import Track from './Track';
import Handle from './Handle';
import styled from '../../styled';

type Props = {
  values: number[];
  min: number;
  max: number;
  className: string;
};

class RangeSlider extends PureComponent<Props> {
  private handleTrackClick = (value: number) => {
    // Get closed "handle"/value and change it
  };

  private handleHandleChange = (index: number, value: number) => {};

  render() {
    const { values, min, max, className } = this.props;

    return (
      <div className={className}>
        <Track onClick={this.handleTrackClick} min={min} max={max}>
          {values.map((value, index) => (
            <Handle
              key={index}
              value={value}
              index={index}
              onChange={this.handleHandleChange}
              min={min}
              max={max}
            />
          ))}
        </Track>
      </div>
    );
  }
}

export default styled(RangeSlider)`
  height: 5px;
`;
