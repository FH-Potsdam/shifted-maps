import use from 'reuse';
import styled from 'styled-components';

import Duration from '../icons/duration.svg';
import Frequency from '../icons/frequency.svg';
import Geographic from '../icons/geographic.svg';
import Go from '../icons/go.svg';
import Info from '../icons/info.svg';
import Map from '../icons/map.svg';

export const Icon = styled(use())`
  fill: currentColor;
  width: 1em;
  height: 1em;
  vertical-align: -3px;
`;

export const DurationIcon = styled(use(Icon, Duration))``;
export const FrequencyIcon = styled(use(Icon, Frequency))``;
export const GeographicIcon = styled(use(Icon, Geographic))``;
export const GoIcon = styled(use(Icon, Go))``;
export const MapIcon = styled(use(Icon, Map))``;
export const InfoIcon = styled(use(Icon, Info))``;
