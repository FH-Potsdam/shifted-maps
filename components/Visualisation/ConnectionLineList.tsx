import { observer } from 'mobx-react';
import { Component } from 'react';

import ConnectionLineModel from '../../stores/ConnectionLine';
import ConnectionLine from './ConnectionLine';

interface IProps {
  connectionLines: ConnectionLineModel[];
}

@observer
class ConnectionLineList extends Component<IProps> {
  public render() {
    const { connectionLines } = this.props;

    return (
      <g>
        {connectionLines.map(connectionLine => (
          <ConnectionLine key={connectionLine.key} connectionLine={connectionLine} />
        ))}
      </g>
    );
  }
}

export default ConnectionLineList;
