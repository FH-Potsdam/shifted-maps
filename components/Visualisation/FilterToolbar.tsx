import { Component, createRef, RefObject } from 'react';

import styled, { css } from '../styled';
import Heading from '../common/Heading';
import { observer } from 'mobx-react';
import DataStore from '../../store/DataStore';
import UIStore, { VIEW } from '../../store/UIStore';
import Icon from '../common/Icon';

type Props = {
  className?: string;
  data: DataStore;
  ui: UIStore;
  onViewChange: (view: VIEW) => void;
};

@observer
class FilterToolbar extends Component<Props> {
  ref: RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);

    this.ref = createRef();
  }

  componentDidMount() {
    this.ref.current!.addEventListener('dblclick', this.stopPropagation);
  }

  componentWillUnmount() {
    this.ref.current!.removeEventListener('dblclick', this.stopPropagation);
  }

  stopPropagation = (event: MouseEvent) => {
    // Prevent map from dragging when mouse was clicked on filter toolbar.
    event.stopPropagation();
  };

  render() {
    const { className, data, ui } = this.props;

    return (
      <div ref={this.ref} className={className}>
        <Heading use="h1">Shifted Maps</Heading>
        <FilterBarStats>
          <dt>Places:</dt>
          <dd>{data.visiblePlaces.length}</dd>
          <dt>Connections:</dt>
          <dd>{data.visibleConnections.length}</dd>
        </FilterBarStats>
        <FilterBarViewList>
          <FilterBarViewButton
            onClick={() => this.props.onViewChange(VIEW.GEOGRAPHIC)}
            active={ui.view === VIEW.GEOGRAPHIC}
          >
            <Icon name="geographic" title="Geographic View" />
          </FilterBarViewButton>
          <FilterBarViewButton
            onClick={() => this.props.onViewChange(VIEW.DURATION)}
            active={ui.view === VIEW.DURATION}
          >
            <Icon name="duration" title="Temporal View" />
          </FilterBarViewButton>
          <FilterBarViewButton
            onClick={() => this.props.onViewChange(VIEW.FREQUENCY)}
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
      color: ${props => props.theme.highlightColor};
    `};
`;
