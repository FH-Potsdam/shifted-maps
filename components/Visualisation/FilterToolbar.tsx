import { clearAllBodyScrollLocks, disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
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

  componentWillUnmount() {
    enableBodyScroll(this.ref.current!);
  }

  render() {
    const { className, device } = this.props;
    const mobileOrTablet = device === DEVICE.mobile || device === DEVICE.tablet;

    return (
      <div
        className={classNames(className, { collapsed: mobileOrTablet && this.collapsed })}
        ref={this.ref}
      >
        <NextLink href="/">
          <HeadlingLink onClick={this.handleHeadingClick}>
            <Heading use="h1">
              <span>
                {mobileOrTablet && this.renderActiveView()}
                Shifted Maps
              </span>
              {mobileOrTablet && <DownIcon />}
            </Heading>
          </HeadlingLink>
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
          <strong>{start.format('D. MMM ‘YY')}</strong>
          <span>{start.format('dddd')}</span>
        </SliderRangeStart>
        <SliderRangeEnd>
          <strong>{end.format('D. MMM ‘YY')}</strong>
          <span>{end.format('dddd')}</span>
        </SliderRangeEnd>
      </SliderRange>
    );
  }

  @action
  private handleHeadingClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const { device } = this.props;

    if (device !== DEVICE.mobile && device !== DEVICE.tablet) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
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
    width: ${props => props.theme.spacingUnit * 16}px;
    height: auto;
    max-height: calc(100% - ${props => props.theme.spacingUnit * 2}px);
    overflow: auto;

    ${Heading} {
      height: auto;
    }
  }
`;

const ViewSection = styled.section`
  grid-area: view;
  margin-top: ${props => props.theme.spacingUnit * 1.5}px;

  @media (min-width: 440px) {
    margin-top: ${props => props.theme.spacingUnit * 0.75}px;
  }

  @media (min-width: 580px) {
    margin-top: ${props => props.theme.spacingUnit * 1.5}px;
  }
`;

const TimeSection = styled.section`
  grid-area: time;
  margin-top: ${props => props.theme.spacingUnit * 1.5}px;

  @media (min-width: 440px) {
    margin-top: ${props => props.theme.spacingUnit * 0.75}px;
  }

  @media (min-width: 580px) {
    margin-top: ${props => props.theme.spacingUnit * 1.5}px;
  }
`;

const HeadlingLink = styled.a`
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
  margin-top: ${props => props.theme.spacingUnit * 1}px;
`;

const ViewName = styled.strong`
  margin-right: ${props => props.theme.spacingUnit * 0.75}px;
  color: ${props => props.theme.highlightColor};
`;

const ViewText = styled.p`
  color: ${props => transparentize(0.4, props.theme.foregroundColor)};
`;

const TimeSlider = styled(Slider)`
  margin-top: ${props => props.theme.spacingUnit * 3}px;
  margin-left: 5px;
  margin-right: 5px;

  &.active {
    color: ${props => props.theme.highlightColor};
  }
`;

const SliderRangeValue = styled.div`
  width: 50%;

  strong {
    display: block;
  }

  span {
    color: ${props => transparentize(0.4, props.theme.foregroundColor)};
  }
`;

const SliderRange = styled.div`
  display: flex;
  margin-top: ${props => props.theme.spacingUnit * 0.25}px;

  &.active {
    color: ${props => props.theme.highlightColor};
  }
`;

const SliderRangeStart = styled(SliderRangeValue)`
  text-align: left;
`;

const SliderRangeEnd = styled(SliderRangeValue)`
  text-align: right;
`;
