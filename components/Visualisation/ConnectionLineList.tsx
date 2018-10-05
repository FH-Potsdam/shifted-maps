import { Component } from 'react';
import { Stores } from './Visualisation';
import { inject, observer } from 'mobx-react';

import ConnectionLineModel from '../../store/ConnectionLine';
import ConnectionLine from './ConnectionLine';

type Props = {
  connectionLines?: ConnectionLineModel[];
};

@inject(
  ({ vis }: Stores): Partial<Props> => ({
    connectionLines: vis && vis.sortedConnectionLines,
  })
)
@observer
class ConnectionLineList extends Component<Props> {
  render() {
    const { connectionLines } = this.props;

    if (connectionLines == null) {
      throw new Error('Missing connection lines.');
    }

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
