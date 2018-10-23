import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import classNames from 'classnames';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import { transparentize } from 'polished';
import { Component, createRef, MouseEvent, RefObject } from 'react';

import DataStore, { DAY_IN_SEC } from '../../stores/DataStore';
import UIStore, { VIEW } from '../../stores/UIStore';
import { formatDistance, formatDuration, formatFrequency } from '../../stores/utils/formatLabel';
import Heading from '../common/Heading';
import { DurationIcon, FrequencyIcon, GeographicIcon, Icon, MapIcon } from '../common/icons';
import Slider from '../common/Slider';
import styled from '../styled';

interface IProps {
  className?: string;
  data: DataStore;
  ui: UIStore;
  onViewChange: (view?: VIEW) => void;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
}

@observer
class FilterBar extends Component<IProps> {
  private ref: RefObject<HTMLDivElement>;

  @observable
  private currentTimeSpan?: ReadonlyArray<number>;

  constructor(props: IProps) {
    super(props);

    this.ref = createRef();
  }

  componentDidMount() {
    disableBodyScroll(this.ref.current!);
  }

  @computed
  get timeSliderActive() {
    return (
      this.timeSpan[0] !== this.props.data.timeSpan[0] ||
      this.timeSpan[1] !== this.props.data.timeSpan[1]
    );
  }

  @computed
  get timeSpan() {
    const { data, ui } = this.props;

    return ui.timeSpan || data.timeSpan;
  }

  componentWillUnMount() {
    enableBodyScroll(this.ref.current!);
  }

  render() {
    const { className } = this.props;

    return (
      <div className={className} ref={this.ref}>
        <Heading use="h1">Shifted Maps</Heading>
        {this.renderViewList()}
        {this.renderViewInfo()}
        {this.renderStats()}
        {this.renderTimeSlider()}
        {this.renderTimeRange()}
      </div>
    );
  }

  private renderStats() {
    const { data, ui } = this.props;

    if (ui.view === VIEW.GEOGRAPHIC) {
      return (
        <Stats>
          <dt>Total Distance:</dt>
          <dd>{formatDistance(data.totalConnectionDistance)}</dd>
          <dt>Avg. Distance:</dt>
          <dd>{formatDistance(data.averageConnectionDistance)}</dd>
        </Stats>
      );
    }

    if (ui.view === VIEW.DURATION) {
      return (
        <Stats>
          <dt>Total Duration:</dt>
          <dd>{formatDuration(data.totalConnectionDuration)}</dd>
          <dt>Avg. Duration:</dt>
          <dd>{formatDuration(data.averageConnectionDuration)}</dd>
        </Stats>
      );
    }

    if (ui.view === VIEW.FREQUENCY) {
      return (
        <Stats>
          <dt>Total Frequency:</dt>
          <dd>{formatFrequency(data.totalConnectionFrequency)}</dd>
          <dt>Avg. Frequency:</dt>
          <dd>{formatFrequency(data.averageConnectionFrequency)}</dd>
        </Stats>
      );
    }

    return (
      <Stats>
        <dt>Places:</dt>
        <dd>{data.visiblePlaces.length}</dd>
        <dt>Connections:</dt>
        <dd>{data.visibleConnections.length}</dd>
      </Stats>
    );
  }

  private renderViewList() {
    const { ui } = this.props;

    return (
      <ViewList>
        <ViewButton
          onClick={event => this.handleViewButtonClick(event)}
          className={classNames({ active: ui.view == null })}
        >
          <MapIcon />
        </ViewButton>
        <ViewButton
          onClick={event => this.handleViewButtonClick(event, VIEW.GEOGRAPHIC)}
          className={classNames({ active: ui.view === VIEW.GEOGRAPHIC })}
        >
          <GeographicIcon />
        </ViewButton>
        <ViewButton
          onClick={event => this.handleViewButtonClick(event, VIEW.DURATION)}
          className={classNames({ active: ui.view === VIEW.DURATION })}
        >
          <DurationIcon />
        </ViewButton>
        <ViewButton
          onClick={event => this.handleViewButtonClick(event, VIEW.FREQUENCY)}
          className={classNames({ active: ui.view === VIEW.FREQUENCY })}
        >
          <FrequencyIcon />
        </ViewButton>
      </ViewList>
    );
  }

  private renderViewInfo() {
    const { ui } = this.props;
    let viewName = 'Map';
    let viewText = 'Places are positioned by their geospatial location.';

    if (ui.view === VIEW.GEOGRAPHIC) {
      viewName = 'Travel Distance';
      viewText = 'Network is arranged by average distance travelled between places.';
    }

    if (ui.view === VIEW.DURATION) {
      viewName = 'Travel Time';
      viewText = 'Network is arranged by average time it took to get from one place to another.';
    }

    if (ui.view === VIEW.FREQUENCY) {
      viewName = 'Travel Frequency';
      viewText = 'Network is arranged by total frequency of travels between places.';
    }

    return (
      <ViewInfo>
        <ViewName>{viewName}</ViewName>
        <ViewText>{viewText}</ViewText>
      </ViewInfo>
    );
  }

  private renderTimeSlider() {
    const { data } = this.props;

    return (
      <TimeSlider
        className={classNames({ active: this.timeSliderActive })}
        onChange={this.handleTimeSpanChange}
        onUpdate={this.handleTimeSpanUpdate}
        domain={data.timeSpan}
        values={this.timeSpan}
        step={DAY_IN_SEC}
      />
    );
  }

  private renderTimeRange() {
    const timeSpan = this.currentTimeSpan || this.timeSpan;
    const start = moment.unix(timeSpan[0]);
    const end = moment.unix(timeSpan[1]);

    return (
      <SliderRange className={classNames({ active: this.timeSliderActive })}>
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

  private handleViewButtonClick(event: MouseEvent<HTMLButtonElement>, view?: VIEW) {
    event.stopPropagation();

    this.props.onViewChange(view);
  }

  @action
  private handleTimeSpanUpdate = (timeSpan: ReadonlyArray<number>) => {
    this.currentTimeSpan = timeSpan;
  };

  @action
  private handleTimeSpanChange = (timeSpan: ReadonlyArray<number>) => {
    this.currentTimeSpan = undefined;

    this.props.onTimeSpanChange(timeSpan);
  };
}

export default styled(FilterBar)`
  background-color: rgba(255, 255, 255, 0.9);
  padding: ${props => props.theme.spacingUnit * 1.5}px ${props => props.theme.spacingUnit * 1.25}px;
  width: ${props => props.theme.spacingUnit * 15}px;
  position: absolute;
  z-index: 1;
  top: ${props => props.theme.spacingUnit}px;
  left: ${props => props.theme.spacingUnit}px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  ${Heading} {
    font-size: ${props => props.theme.fontSizeBig}px;
  }
`;

const Stats = styled.dl`
  display: flex;
  margin: 0;
  margin-top: ${props => props.theme.spacingUnit * 1}px;
  border-top: 1px solid ${props => transparentize(0.8, props.theme.highlightColor)};
  padding-top: ${props => props.theme.spacingUnit * 1}px;
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

const ViewList = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacingUnit * 1.25}px;
`;

const ViewButton = styled.button`
  transition: color ${props => props.theme.shortTransitionDuration},
    transform ${props => props.theme.shortTransitionDuration};
  border: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 50%;
  cursor: pointer;
  color: ${props => props.theme.foregroundColor};
  padding: 0;
  background-color: white;
  transform: scale(1);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.2);

  ${Icon} {
    width: 32px;
    height: 32px;
  }

  & + & {
    margin-left: ${props => props.theme.spacingUnit * 1}px;
  }

  &:hover,
  &.active {
    color: ${props => props.theme.highlightColor};
  }

  &:active,
  &.active {
    transform: scale(0.95);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const ViewInfo = styled.div`
  margin-top: ${props => props.theme.spacingUnit * 0.75}px;
`;

const ViewName = styled.strong`
  margin-right: ${props => props.theme.spacingUnit * 0.75}px;
  color: ${props => props.theme.highlightColor};
`;

const ViewText = styled.p`
  font-size: ${props => props.theme.fontSizeSmall}px;
`;

const TimeSlider = styled(Slider)`
  margin-top: ${props => props.theme.spacingUnit * 1.5}px;
  margin-left: 5px;
  margin-right: 5px;

  &.active {
    color: ${props => props.theme.highlightColor};
  }
`;

const SliderRangeValue = styled.div`
  width: 50%;
  font-size: ${props => props.theme.fontSizeSmall}px;

  strong {
    display: block;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const SliderRange = styled.div`
  display: flex;
  margin-top: ${props => props.theme.spacingUnit * 0.25}px;

  &.active {
    ${SliderRangeValue} strong {
      color: ${props => props.theme.highlightColor};
    }
  }
`;

const SliderRangeStart = styled(SliderRangeValue)`
  text-align: left;
`;

const SliderRangeEnd = styled(SliderRangeValue)`
  text-align: right;
`;
