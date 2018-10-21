import moment from 'moment';
import round from './round';

const roundFrequency = round(0.01);

export function formatDistance(distance: number) {
  if (distance >= 1000) {
    return `${Math.round(distance / 1000).toLocaleString()} km`;
  }

  return `${Math.round(distance).toLocaleString()} m`;
}

export function formatFrequency(frequency: number) {
  return `${roundFrequency(frequency)} ×`;
}

export function formatDuration(duration: number) {
  return moment.duration(duration, 'seconds').humanize();
}
