import { PureComponent, SyntheticEvent } from 'react';

import styled from '../../styled';

type Props = {
  min: number;
  max: number;
  onClick: (value: number) => void;
  className?: string;
};

class Track extends PureComponent<Props> {
  private handleClick = (event: SyntheticEvent) => {};

  render() {
    const { className, children } = this.props;

    return (
      <div onClick={this.handleClick} className={className}>
        {children}
      </div>
    );
  }
}

export default styled(Track)`
  position: relative;
  height: 100%;
`;
