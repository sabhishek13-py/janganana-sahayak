import type { DateWindow, IsoDate } from '@/data/census2027';

const MS_PER_DAY = 86_400_000;

/**
 * Census windows are Indian civil dates, and every reader of this app is in one
 * timezone. IST is UTC+5:30 with no daylight saving, so a fixed offset is exact
 * rather than an approximation.
 */
const IST_OFFSET_MS = 5.5 * 3_600_000;

/** Parses `YYYY-MM-DD` at UTC midnight, so day maths never shifts with the viewer's timezone. */
export function toUtcTimestamp(date: IsoDate): number {
  const parsed = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed)) throw new Error(`Not an ISO date: ${date}`);
  return parsed;
}

export function toIsoDate(instant: Date): IsoDate {
  const iso = instant.toISOString();
  return iso.slice(0, 10);
}

/**
 * The calendar date it currently is *in India*, which is the date a census
 * window is expressed in. Using the UTC date instead would move every window
 * boundary to 05:30 IST: a window notified to open on 1 April would still read
 * as closed for the first five and a half hours of that morning.
 */
export function toIstDate(instant: Date): IsoDate {
  return toIsoDate(new Date(instant.getTime() + IST_OFFSET_MS));
}

/** The instant IST midnight begins on the given date. */
export function istMidnight(date: IsoDate): number {
  return toUtcTimestamp(date) - IST_OFFSET_MS;
}

/** Whole days from `from` to `to`. Negative when `to` is in the past. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcTimestamp(to) - toUtcTimestamp(from)) / MS_PER_DAY);
}

/** Inclusive length of a window, in days. A 1 Apr - 15 Apr window is 15 days. */
export function windowLengthDays(window: DateWindow): number {
  return daysBetween(window.start, window.end) + 1;
}

export function shiftDays(date: IsoDate, delta: number): IsoDate {
  return toIsoDate(new Date(toUtcTimestamp(date) + delta * MS_PER_DAY));
}

export type WindowPhase = 'BEFORE' | 'OPEN' | 'AFTER';

/** ISO dates sort lexicographically, so plain comparison is correct and allocation-free. */
export function windowPhase(window: DateWindow, today: IsoDate): WindowPhase {
  if (today < window.start) return 'BEFORE';
  if (today > window.end) return 'AFTER';
  return 'OPEN';
}

export interface Countdown {
  readonly phase: WindowPhase;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
}

/**
 * Time remaining until a window opens, or until it closes once it is open.
 * Both the phase and the target instant are anchored to IST, so the countdown
 * reaches zero exactly as the window turns over for the reader.
 */
export function countdownTo(window: DateWindow, now: Date): Countdown {
  const phase = windowPhase(window, toIstDate(now));
  if (phase === 'AFTER') return { phase, days: 0, hours: 0, minutes: 0 };
  const targetIso = phase === 'BEFORE' ? window.start : shiftDays(window.end, 1);
  const remainingMs = Math.max(0, istMidnight(targetIso) - now.getTime());
  return {
    phase,
    days: Math.floor(remainingMs / MS_PER_DAY),
    hours: Math.floor((remainingMs % MS_PER_DAY) / 3_600_000),
    minutes: Math.floor((remainingMs % 3_600_000) / 60_000),
  };
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Formats `YYYY-MM` as e.g. "February 2027". */
export function formatIsoMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split('-');
  const index = Number(month) - 1;
  const name = MONTH_NAMES[index];
  if (year === undefined || name === undefined) throw new Error(`Not an ISO month: ${isoMonth}`);
  return `${name} ${year}`;
}
