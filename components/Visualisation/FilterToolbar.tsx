import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Component } from 'react';

import DataStore, { DAY_IN_SEC } from '../../stores/DataStore';
import UIStore, { VIEW } from '../../stores/UIStore';
import { formatDistance, formatDuration, formatFrequency } from '../../stores/utils/formatLabel';
import Heading from '../common/Heading';
import { DurationIcon, FrequencyIcon, GeographicIcon } from '../common/icons';
import Slider from '../common/Slider';
import styled, { css } from '../styled';

interface IProps {
  className?: string;
  data: DataStore;
  ui: UIStore;
  onViewChange: (view?: VIEW) => void;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
}

@observer
class FilterBar extends Component<IProps> {
  @observable
  timeSpan: ReadonlyArray<number>;

  constructor(props: IProps) {
    super(props);

    this.timeSpan = props.ui.timeSpan || props.data.timeSpan;
  }

  handleToggleView(view: VIEW) {
    this.props.onViewChange(view !== this.props.ui.view ? view : undefined);
  }

  @action
  handleTimeSpanUpdate = (timeSpan: ReadonlyArray<number>) => {
    this.timeSpan = timeSpan;
  };

  @action
  handleTimeSpanChange = (timeSpan: ReadonlyArray<number>) => {
    this.timeSpan = timeSpan;

    this.props.onTimeSpanChange(timeSpan);
  };

  render() {
    const { className } = this.props;

    return (
      <div className={className}>
        <Heading use="h1">Shifted Maps</Heading>
        {this.renderStats()}
        {this.renderViewList()}
        {this.renderTimeSlider()}
        {this.renderTimeRange()}
      </div>
    );
  }

  private renderStats() {
    const { data, ui } = this.props;

    if (ui.view === VIEW.GEOGRAPHIC) {
      return (
        <FilterBarStats>
          <dt>Travel Distance:</dt>
          <dd>{formatDistance(data.totalConnectionDistance)}</dd>
          <dt>Avg. Distance:</dt>
          <dd>{formatDistance(data.averageConnectionDistance)}</dd>
        </FilterBarStats>
      );
    }

    if (ui.view === VIEW.DURATION) {
      return (
        <FilterBarStats>
          <dt>Travel Duration:</dt>
          <dd>{formatDuration(data.totalConnectionDuration)}</dd>
          <dt>Avg. Duration:</dt>
          <dd>{formatDuration(data.averageConnectionDuration)}</dd>
        </FilterBarStats>
      );
    }

    if (ui.view === VIEW.FREQUENCY) {
      return (
        <FilterBarStats>
          <dt>Travel Frequency:</dt>
          <dd>{formatFrequency(data.totalConnectionFrequency)}</dd>
          <dt>Avg. Frequency:</dt>
          <dd>{formatFrequency(data.averageConnectionFrequency)}</dd>
        </FilterBarStats>
      );
    }

    return (
      <FilterBarStats>
        <dt>Places:</dt>
        <dd>{data.visiblePlaces.length}</dd>
        <dt>Connections:</dt>
        <dd>{data.visibleConnections.length}</dd>
      </FilterBarStats>
    );
  }

  private renderViewList() {
    const { ui } = this.props;

    return (
      <FilterBarViewList>
        <FilterBarViewButton
          onClick={() => this.handleToggleView(VIEW.GEOGRAPHIC)}
          active={ui.view === VIEW.GEOGRAPHIC}
        >
          <GeographicIcon width="32" height="32" />
        </FilterBarViewButton>
        <FilterBarViewButton
          onClick={() => this.handleToggleView(VIEW.DURATION)}
          active={ui.view === VIEW.DURATION}
        >
          <DurationIcon />
        </FilterBarViewButton>
        <FilterBarViewButton
          onClick={() => this.handleToggleView(VIEW.FREQUENCY)}
          active={ui.view === VIEW.FREQUENCY}
        >
          <FrequencyIcon width="32" height="32" />
        </FilterBarViewButton>
      </FilterBarViewList>
    );
  }

  private renderTimeSlider() {
    const { data, ui } = this.props;

    return (
      <TimeSlider
        onUpdate={this.handleTimeSpanUpdate}
        onChange={this.handleTimeSpanChange}
        domain={data.timeSpan}
        values={this.timeSpan || ui.timeSpan}
        step={DAY_IN_SEC}
      />
    );
  }

  private renderTimeRange() {
    const start = moment.unix(this.timeSpan[0]);
    const end = moment.unix(this.timeSpan[1]);

    return (
      <SliderRange>
        <SliderRangeStart>
          <strong>{start.format('dddd')}</strong>
          {start.format('D. MMM YYYY')}
        </SliderRangeStart>
        <SliderRangeEnd>
          <strong>{end.format('dddd')}</strong>
          {end.format('D. MMM YYYY')}
        </SliderRangeEnd>
      </SliderRange>
    );
  }
}

export default styled(FilterBar)`
  background-color: rgba(255, 255, 255, 0.9);
  padding: ${props => props.theme.spacingUnit * 1.5}px ${props => props.theme.spacingUnit}px;
  width: ${props => props.theme.spacingUnit * 14}px;
  position: absolute;
  z-index: 1;
  top: ${props => props.theme.spacingUnit}px;
  left: ${props => props.theme.spacingUnit}px;

  ${Heading} {
    font-size: ${props => props.theme.fontSizeBig}px;
  }
`;

const FilterBarStats = styled.dl`
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  margin-top: ${props => props.theme.spacingUnit}px;
  justify-content: space-between;

  dt,
  dd {
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
  background-color: white;

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

const TimeSlider = styled(Slider)`
  margin-top: ${props => props.theme.spacingUnit * 2}px;
  margin-left: 5px;
  margin-right: 5px;
`;

const SliderRange = styled.div`
  display: flex;
  margin-top: ${props => props.theme.spacingUnit * 0.5}px;
`;

const SliderRangeValue = styled.div`
  width: 50%;
  font-style: italic;

  strong {
    display: block;
    font-style: normal;
    text-transform: uppercase;
    font-size: ${props => props.theme.fontSizeSmall}px;
  }
`;

const SliderRangeStart = styled(SliderRangeValue)`
  text-align: left;
`;

const SliderRangeEnd = styled(SliderRangeValue)`
  text-align: right;
`;
