import { Component } from 'react';
import { observer } from 'mobx-react';

import ConnectionLineModel from '../../store/ConnectionLine';
import ConnectionLine from './ConnectionLine';

type Props = {
  connectionLines: ConnectionLineModel[];
};

@observer
class ConnectionLineList extends Component<Props> {
  render() {
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
