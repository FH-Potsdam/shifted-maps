import { ReactNode } from 'react';

import DataStore from '../../../stores/DataStore';
import { VIEW } from '../../../stores/UIStore';
import { formatDistance, formatDuration, formatFrequency } from '../../../stores/utils/formatLabel';
import { Icon } from '../../common/icons/components';
import DurationIcon from '../common/icons/duration.svg';
import FrequencyIcon from '../common/icons/frequency.svg';
import GeographicIcon from '../common/icons/geographic.svg';
import MapIcon from '../common/icons/map.svg';

export interface IViewStatItem {
  name: string;
  data: (data: DataStore) => ReactNode;
}

export interface IViewItem {
  icon: ReactNode;
  name: string;
  text: string;
  stats: IViewStatItem[];
  type?: VIEW;
}

export const VIEW_LIST: IViewItem[] = [
  {
    icon: <Icon as={MapIcon} />,
    name: 'Map',
    stats: [
      {
        data: data => data.visiblePlaces.length,
        name: 'Places',
      },
      {
        data: data => data.visibleConnections.length,
        name: 'Connections',
      },
    ],
    text: 'Places are positioned by their geospatial location.',
  },
  {
    icon: <Icon as={GeographicIcon} />,
    name: 'Travel Distance',
    stats: [
      {
        data: data => formatDistance(data.totalConnectionDistance),
        name: 'Total Distance',
      },
      {
        data: data => formatDistance(data.averageConnectionDistance),
        name: 'Avg. Distance',
      },
    ],
    text: 'Network is arranged by average distance travelled between places.',
    type: VIEW.GEOGRAPHIC,
  },
  {
    icon: <Icon as={DurationIcon} />,
    name: 'Travel Time',
    stats: [
      {
        data: data => formatDuration(data.totalConnectionDuration),
        name: 'Total Duration',
      },
      {
        data: data => formatDuration(data.averageConnectionDuration),
        name: 'Avg. Duration',
      },
    ],
    text: 'Network is arranged by average distance travelled between places.',
    type: VIEW.DURATION,
  },
  {
    icon: <Icon as={FrequencyIcon} />,
    name: 'Travel Frequency',
    stats: [
      {
        data: data => formatFrequency(data.totalConnectionFrequency),
        name: 'Total Trips',
      },
      {
        data: data => formatFrequency(data.averageConnectionFrequency),
        name: 'Avg. Frequency',
      },
    ],
    text: 'Network is arranged by average distance travelled between places.',
    type: VIEW.FREQUENCY,
  },
];

export function getActiveViewItem(view: VIEW | undefined) {
  const activeView = VIEW_LIST.find(viewItem => viewItem.type === view);

  if (activeView == null) {
    throw new Error('Provided view invalid.');
  }

  return activeView;
}
