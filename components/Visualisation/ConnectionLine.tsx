import { Component } from 'react';
import { observer } from 'mobx-react';

import ConnectionLineModel from '../../store/ConnectionLine';
import styled from '../styled';

type Props = {
  connectionLine: ConnectionLineModel;
};

@observer
class ConnectionLine extends Component<Props> {
  render() {
    const { connectionLine } = this.props;
    const { from, to, strokeWidth } = connectionLine;

    return (
      <g>
        <ConnectionLineLine
          x1={from.mapPoint.x}
          y1={from.mapPoint.y}
          x2={to.mapPoint.x}
          y2={to.mapPoint.y}
          style={{ strokeWidth: `${strokeWidth}px` }}
        />
      </g>
    );
  }
}

const ConnectionLineLine = styled.line`
  stroke: ${props => props.theme.foregroundColor};
`;

export default ConnectionLine;
