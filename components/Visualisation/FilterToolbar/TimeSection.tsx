import classNames from 'classnames';
import { observer } from 'mobx-react';
import moment from 'moment';
import { transparentize } from 'polished';
import { useCallback, useState } from 'react';
import DataStore, { DAY_IN_SEC } from '../../../stores/DataStore';
import UIStore from '../../../stores/UIStore';
import Slider from '../../common/Slider';
import styled from '../../styled';
import Stats from './Stats';

interface TimeSectionProps {
  className?: string;
  ui: UIStore;
  data: DataStore;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
}

const TimeSection = observer((props: TimeSectionProps) => {
  const { className, ui, data, onTimeSpanChange } = props;
  const timeSpan = ui.timeSpan || data.timeSpan;
  const timeSliderActive = timeSpan[0] !== data.timeSpan[0] || timeSpan[1] !== data.timeSpan[1];
  const [currentTimeSpan, setCurrentTimeSpan] = useState<ReadonlyArray<number>>();
  const handleTimeSpanChange = useCallback(
    (timeSpan: ReadonlyArray<number>) => {
      setCurrentTimeSpan(undefined);
      onTimeSpanChange(timeSpan);
    },
    [onTimeSpanChange]
  );

  const [timeSpanStart, timeSpanEnd] = currentTimeSpan || timeSpan;
  const timeSpanStartMoment = moment.unix(timeSpanStart);
  const timeSpanEndMoment = moment.unix(timeSpanEnd);

  return (
    <section className={className}>
      <Stats ui={ui} data={data} />
      <TimeSlider
        className={classNames({ active: timeSliderActive })}
        onChange={handleTimeSpanChange}
        onUpdate={setCurrentTimeSpan}
        domain={data.timeSpan}
        values={timeSpan}
        step={DAY_IN_SEC}
      />
      <SliderRange className={classNames({ active: timeSliderActive })}>
        <SliderRangeStart>
          <strong>{timeSpanStartMoment.format('D. MMM ‘YY')}</strong>
          <span>{timeSpanStartMoment.format('dddd')}</span>
        </SliderRangeStart>
        <SliderRangeEnd>
          <strong>{timeSpanEndMoment.format('D. MMM ‘YY')}</strong>
          <span>{timeSpanEndMoment.format('dddd')}</span>
        </SliderRangeEnd>
      </SliderRange>
    </section>
  );
});

export default styled(TimeSection)`
  grid-area: time;
  margin-top: ${props => props.theme.spacingUnit * 1.5}px;

  @media (min-width: 440px) {
    margin-top: ${props => props.theme.spacingUnit * 0.75}px;
  }

  @media (min-width: 580px) {
    margin-top: ${props => props.theme.spacingUnit * 1.5}px;
  }
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
