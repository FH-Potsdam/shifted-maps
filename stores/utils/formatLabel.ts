import round from './round';

const roundFrequency = round(0.01);

const durationFormatter = new Intl.DurationFormat('en', { style: 'long' });

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
  const totalSeconds = Math.round(Math.abs(duration));

  if (totalSeconds < 60) {
    return durationFormatter.format({ seconds: totalSeconds });
  }

  const totalMinutes = Math.round(totalSeconds / 60);

  if (totalMinutes < 60) {
    return durationFormatter.format({ minutes: totalMinutes });
  }

  const totalHours = Math.round(totalSeconds / (60 * 60));

  if (totalHours < 24) {
    return durationFormatter.format({ hours: totalHours });
  }

  return durationFormatter.format({ days: Math.round(totalSeconds / (60 * 60 * 24)) });
}
