import { observer } from 'mobx-react';
import { Fragment } from 'react';
import styled from 'styled-components';
import DataStore from '../../../stores/DataStore';
import UIStore from '../../../stores/UIStore';
import { getActiveViewItem } from './config';

interface StatsProps {
  className?: string;
  ui: UIStore;
  data: DataStore;
}

const Stats = observer((props: StatsProps) => {
  const { className, ui, data } = props;
  const activeViewItem = getActiveViewItem(ui.view);

  return (
    <dl className={className}>
      {activeViewItem.stats.map((statItem, index) => (
        <Fragment key={index}>
          <dt>{statItem.name}:</dt>
          <dd>{statItem.data(data)}</dd>
        </Fragment>
      ))}
    </dl>
  );
});

export default styled(Stats)`
  display: flex;
  margin: 0;
  flex-wrap: wrap;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  user-select: none;

  dt,
  dd {
    margin: 0;
    width: 50%;
  }

  dt {
    white-space: nowrap;
  }

  dd {
    text-align: right;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
    color: ${props => props.theme.highlightColor};
  }
`;
