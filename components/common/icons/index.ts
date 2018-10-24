import use from 'reuse';
import styled from 'styled-components';

import Down from '../icons/down.svg';
import Duration from '../icons/duration.svg';
import Frequency from '../icons/frequency.svg';
import Geographic from '../icons/geographic.svg';
import Go from '../icons/go.svg';
import Info from '../icons/info.svg';
import Map from '../icons/map.svg';

import FHP from '../icons/fhp.svg';
import Here from '../icons/here.svg';
import UCLab from '../icons/uclab.svg';

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
export const DownIcon = styled(
  use(
    Icon,
    styled(Down)`
      stroke-width: 3px;
      stroke: currentColor;
    `
  )
)``;

export const Logo = styled(use())`
  fill: currentColor;
`;

export const FHPLogo = styled(use(Logo, FHP))``;
export const HereLogo = styled(use(Logo, Here))``;
export const UCLabLogo = styled(use(Logo, UCLab))``;
