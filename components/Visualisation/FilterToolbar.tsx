import { Component } from 'react';

import { observer } from 'mobx-react';
import DataStore from '../../stores/DataStore';
import UIStore, { VIEW } from '../../stores/UIStore';
import Heading from '../common/Heading';
import Icon from '../common/Icon';
import styled, { css } from '../styled';

interface IProps {
  className?: string;
  data: DataStore;
  ui: UIStore;
  onViewChange: (view?: VIEW) => void;
}

@observer
class FilterToolbar extends Component<IProps> {
  public handleToggleView(view: VIEW) {
    this.props.onViewChange(view !== this.props.ui.view ? view : undefined);
  }

  public render() {
    const { className, data, ui } = this.props;

    return (
      <div className={className}>
        <Heading use="h1">Shifted Maps</Heading>
        <FilterBarStats>
          <dt>Places:</dt>
          <dd>{data.visiblePlaces.length}</dd>
          <dt>Connections:</dt>
          <dd>{data.visibleConnections.length}</dd>
        </FilterBarStats>
        <FilterBarViewList>
          <FilterBarViewButton
            onClick={() => this.handleToggleView(VIEW.GEOGRAPHIC)}
            active={ui.view === VIEW.GEOGRAPHIC}
          >
            <Icon name="geographic" title="Geographic View" />
          </FilterBarViewButton>
          <FilterBarViewButton
            onClick={() => this.handleToggleView(VIEW.DURATION)}
            active={ui.view === VIEW.DURATION}
          >
            <Icon name="duration" title="Temporal View" />
          </FilterBarViewButton>
          <FilterBarViewButton
            onClick={() => this.handleToggleView(VIEW.FREQUENCY)}
            active={ui.view === VIEW.FREQUENCY}
          >
            <Icon name="frequency" title="Frequency View" />
          </FilterBarViewButton>
        </FilterBarViewList>
      </div>
    );
  }
}

export default styled(FilterToolbar)`
  background-color: rgba(255, 255, 255, 0.9);
  padding: ${props => props.theme.spacingUnit * 1.5}px ${props => props.theme.spacingUnit}px;
  width: ${props => props.theme.spacingUnit * 14}px;

  ${Heading} {
    font-size: ${props => props.theme.fontSizeBig}px;
  }
`;

const FilterBarStats = styled.dl`
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  margin-top: ${props => props.theme.spacingUnit}px;

  dt,
  dd {
    width: 50%;
    margin: 0;
  }

  dt {
    font-style: italic;
  }

  dd {
    text-align: right;
  }
`;

const FilterBarViewList = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${props => props.theme.spacingUnit * 4}px;
`;

const FilterBarViewButton = styled.button<{ active: boolean }>`
  transition: color ${props => props.theme.shortTransitionDuration};
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: ${props => props.theme.foregroundColor};
  padding: 0;
  font-size: ${props => props.theme.spacingUnit * 2}px;

  &:not(:first-child) {
    margin-left: ${props => props.theme.spacingUnit * 1.5}px;
  }

  &:hover {
    color: ${props => props.theme.highlightColor};
  }

  ${props =>
    props.active &&
    css`
      color: ${props.theme.highlightColor};
    `};
`;
