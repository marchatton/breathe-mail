const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

const getDate = (input: Date | string | number): Date =>
  input instanceof Date ? input : new Date(input);

export function formatRelativeTime(now: Date | string | number, isoString: string, locale = 'en'): string {
  const current = getDate(now);
  const target = new Date(isoString);
  const diff = target.getTime() - current.getTime();
  const abs = Math.abs(diff);

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (abs < MINUTE_IN_MS) {
    const value = Math.round(diff / SECOND_IN_MS) || 0;
    return formatter.format(value, 'second');
  }

  if (abs < HOUR_IN_MS) {
    const value = Math.round(diff / MINUTE_IN_MS);
    return formatter.format(value, 'minute');
  }

  if (abs < DAY_IN_MS) {
    const value = Math.round(diff / HOUR_IN_MS);
    return formatter.format(value, 'hour');
  }

  if (abs < WEEK_IN_MS) {
    const value = Math.round(diff / DAY_IN_MS);
    return formatter.format(value, 'day');
  }

  if (abs < MONTH_IN_MS) {
    const value = Math.round(diff / WEEK_IN_MS);
    return formatter.format(value, 'week');
  }

  if (abs < YEAR_IN_MS) {
    const value = Math.round(diff / MONTH_IN_MS);
    return formatter.format(value, 'month');
  }

  const value = Math.round(diff / YEAR_IN_MS);
  return formatter.format(value, 'year');
}

export function formatDurationMinutes(totalMinutes: number, locale = 'en'): string {
  const formatter = new Intl.NumberFormat(locale);
  const rounded = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;

  const segments: string[] = [];

  if (hours > 0) {
    const label = hours === 1 ? 'hour' : 'hours';
    segments.push(`${formatter.format(hours)} ${label}`);
  }

  if (minutes > 0 || segments.length === 0) {
    const label = minutes === 1 ? 'minute' : 'minutes';
    segments.push(`${formatter.format(minutes)} ${label}`);
  }

  return segments.join(' ');
}
