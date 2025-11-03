import { describe, expect, it } from 'vitest';
import { formatDurationMinutes, formatRelativeTime } from './time';

describe('formatRelativeTime', () => {
  it('returns a past-oriented string using minutes granularity', () => {
    const now = new Date('2025-01-23T12:00:00Z');
    const iso = '2025-01-23T11:45:00Z';

    expect(formatRelativeTime(now, iso)).toBe('15 minutes ago');
  });

  it('returns a future-oriented string using hours granularity', () => {
    const now = new Date('2025-01-23T12:00:00Z');
    const iso = '2025-01-23T14:15:00Z';

    expect(formatRelativeTime(now, iso)).toBe('in 2 hours');
  });
});

describe('formatDurationMinutes', () => {
  it('formats durations under an hour as minutes', () => {
    expect(formatDurationMinutes(45)).toBe('45 minutes');
  });

  it('formats multi-hour durations with remaining minutes', () => {
    expect(formatDurationMinutes(135)).toBe('2 hours 15 minutes');
  });
});
