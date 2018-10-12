import { PureComponent } from 'react';

import styled from '../../styled';
import Handle from './Handle';
import Track from './Track';

interface Props {
  values: number[];
  min: number;
  max: number;
  className: string;
}

class RangeSlider extends PureComponent<Props> {

  public render() {
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
  private handleTrackClick = (value: number) => {
    // Get closed "handle"/value and change it
  };

  private handleHandleChange = (index: number, value: number) => {};
}

export default styled(RangeSlider)`
  height: 5px;
`;
