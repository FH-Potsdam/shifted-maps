import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import classNames from 'classnames';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import NextLink from 'next/link';
import { transparentize } from 'polished';
import { Component, createRef, MouseEvent, RefObject } from 'react';

import DataStore, { DAY_IN_SEC } from '../../stores/DataStore';
import UIStore, { VIEW } from '../../stores/UIStore';
import { formatDistance, formatDuration, formatFrequency } from '../../stores/utils/formatLabel';
import Heading from '../common/Heading';
import {
  DownIcon,
  DurationIcon,
  FrequencyIcon,
  GeographicIcon,
  Icon,
  MapIcon,
} from '../common/icons';
import Slider from '../common/Slider';
import styled from '../styled';
import { DEVICE } from './Visualisation';

interface IProps {
  className?: string;
  data: DataStore;
  ui: UIStore;
  device: DEVICE;
  onViewChange: (view?: VIEW) => void;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
}

@observer
class FilterBar extends Component<IProps> {
  private ref: RefObject<HTMLDivElement>;

  @observable
  private currentTimeSpan?: ReadonlyArray<number>;

  @observable
  private collapsed: boolean = true;

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
    const { className, device } = this.props;
    const mobile = device === DEVICE.mobile;

    return (
      <div
        className={classNames(className, { collapsed: mobile && this.collapsed, mobile })}
        ref={this.ref}
      >
        <NextLink href="/">
          <ViewHeading onClick={this.handleHeadingClick}>
            <Heading use="h1">
              <span>
                {mobile && this.renderActiveView()}
                Shifted Maps
              </span>
              {mobile && <DownIcon />}
            </Heading>
          </ViewHeading>
        </NextLink>
        <ViewSection>
          {this.renderViewList()}
          {this.renderViewInfo()}
        </ViewSection>
        <TimeSection>
          {this.renderStats()}
          {this.renderTimeSlider()}
          {this.renderTimeRange()}
        </TimeSection>
      </div>
    );
  }

  private renderActiveView() {
    const { ui } = this.props;

    if (ui.view === VIEW.GEOGRAPHIC) {
      return <GeographicIcon />;
    }

    if (ui.view === VIEW.DURATION) {
      return <DurationIcon />;
    }

    if (ui.view === VIEW.FREQUENCY) {
      return <FrequencyIcon />;
    }

    return <MapIcon />;
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
          <dt>Total Trips:</dt>
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
      viewText = 'Network is arranged by frequency of travels between places.';
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

  @action
  private handleHeadingClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const { device } = this.props;

    if (device === DEVICE.mobile) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.collapsed = !this.collapsed;
  };

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
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas: 'heading' 'view' 'time';
  grid-column-gap: ${props => props.theme.spacingUnit * 1.25}px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0 ${props => props.theme.spacingUnit * 1.25}px;
  padding-bottom: ${props => props.theme.spacingUnit * 1.5}px;
  width: 100%;
  position: absolute;
  z-index: 1;
  left: 0;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  ${Heading} {
    font-size: ${props => props.theme.fontSizeBig}px;
    height: ${props => props.theme.spacingUnit * 3}px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    ${GeographicIcon},
    ${DurationIcon},
    ${FrequencyIcon},
    ${MapIcon} {
      margin-right: ${props => props.theme.spacingUnit}px;
    }
  }

  ${DownIcon} {
    transition: transform ${props => props.theme.shortTransitionDuration};
    transform: rotateX(180deg);
  }

  &.collapsed {
    height: ${props => props.theme.spacingUnit * 3}px;
    top: 0;

    ${DownIcon} {
      transform: rotateX(0deg);
    }
  }

  @media (min-width: 440px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas: 'heading heading' 'view time' 'view time';
    padding-left: ${props => props.theme.spacingUnit * 1.5}px;
    padding-right: ${props => props.theme.spacingUnit * 1.5}px;

    ${Heading} {
      height: ${props => props.theme.spacingUnit * 3.5}px;
    }

    &.collapsed {
      height: ${props => props.theme.spacingUnit * 3.5}px;
    }
  }

  @media (min-width: 580px) {
    display: block;
    padding: ${props => props.theme.spacingUnit * 1.5}px
      ${props => props.theme.spacingUnit * 1.25}px;
    top: ${props => props.theme.spacingUnit}px;
    left: ${props => props.theme.spacingUnit}px;
    width: ${props => props.theme.spacingUnit * 15}px;
    height: auto;
    overflow: visible;

    ${Heading} {
      height: auto;
    }
  }
`;

const ViewSection = styled.section`
  grid-area: view;
  margin-top: ${props => props.theme.spacingUnit * 1}px;

  @media (min-width: 440px) {
    margin-top: ${props => props.theme.spacingUnit * 0.5}px;
  }

  @media (min-width: 580px) {
    margin-top: ${props => props.theme.spacingUnit * 1}px;
  }
`;

const TimeSection = styled.section`
  grid-area: time;
  margin-top: ${props => props.theme.spacingUnit * 1}px;
  border-top: 1px solid ${props => transparentize(0.8, props.theme.highlightColor)};
  padding-top: ${props => props.theme.spacingUnit * 1}px;

  @media (min-width: 440px) {
    margin-top: ${props => props.theme.spacingUnit * 0.5}px;
    border-top: none;
    padding-top: 0;
  }

  @media (min-width: 580px) {
    margin-top: ${props => props.theme.spacingUnit * 1}px;
    border-top: 1px solid ${props => transparentize(0.8, props.theme.highlightColor)};
    padding-top: ${props => props.theme.spacingUnit * 1}px;
  }
`;

const ViewHeading = styled.a`
  text-decoration: none;
  grid-area: heading;
`;

const Stats = styled.dl`
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

const ViewList = styled.div`
  display: flex;
  justify-content: space-between;

  @media (min-width: 440px) {
    justify-content: flex-start;
  }

  @media (min-width: 580px) {
    justify-content: space-between;
  }
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
