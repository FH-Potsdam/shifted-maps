const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: '2-digit',
});
const weekdayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });

function fromUnixTimestamp(timestamp: number) {
  return new Date(timestamp * 1000);
}

export function formatShortDate(timestamp: number) {
  return shortDateFormatter.format(fromUnixTimestamp(timestamp));
}

export function formatWeekday(timestamp: number) {
  return weekdayFormatter.format(fromUnixTimestamp(timestamp));
}
