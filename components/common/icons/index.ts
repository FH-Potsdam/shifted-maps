import use from 'reuse';
import styled from 'styled-components';

import Duration from '../icons/duration.svg';
import Frequency from '../icons/frequency.svg';
import Geographic from '../icons/geographic.svg';
import Go from '../icons/go.svg';

const Icon = styled(use())`
  fill: currentColor;
  width: 32px;
  height: 32px;
`;

export const DurationIcon = styled(use(Icon, Duration))``;
export const FrequencyIcon = styled(use(Icon, Frequency))``;
export const GeographicIcon = styled(use(Icon, Geographic))``;
export const GoIcon = styled(use(Icon, Go))``;
