import { PureComponent, SyntheticEvent } from 'react';

import styled from '../../styled';

interface Props {
  min: number;
  max: number;
  onClick: (value: number) => void;
  className?: string;
}

class Track extends PureComponent<Props> {

  public render() {
    const { className, children } = this.props;

    return (
      <div onClick={this.handleClick} className={className}>
        {children}
      </div>
    );
  }
  private handleClick = (event: SyntheticEvent) => {};
}

export default styled(Track)`
  position: relative;
  height: 100%;
`;
