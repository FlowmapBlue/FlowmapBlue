import { timeFormat, timeParse } from 'd3-time-format';
import {
  timeDay,
  timeHour,
  TimeInterval,
  timeMinute,
  timeMonth,
  timeSecond,
  timeWeek,
  timeYear,
} from 'd3-time';

const dateParsers = [
  timeParse('%Y-%m-%d'),
  timeParse('%Y-%m-%d %H:%M'),
  timeParse('%Y-%m-%d %H:%M:%S'),
  timeParse('%Y'),
  timeParse('%Y-%m'),
];

export function parseTime(input: string | Date | undefined): Date | undefined {
  if (input != null) {
    if (input instanceof Date) {
      return input;
    }
    for (const parse of dateParsers) {
      const date = parse(input);
      if (date) {
        return date;
      }
    }
  }
  return undefined;
}

const GSHEETS_TIME_VALUE_PATTERN = /^Date\((\d{4}),(\d+),(\d+),(\d+),(\d+),(\d+)\)$/;

export function isGSheetsTime(input: string | undefined): boolean {
  return input != null && input.startsWith('Date') && GSHEETS_TIME_VALUE_PATTERN.test(input);
}

export function parseGSheetsTime(input: string | undefined): Date | undefined {
  if (input != null) {
    const m = GSHEETS_TIME_VALUE_PATTERN.exec(input);
    if (m) {
      return new Date(+m[1], +m[2], +m[3], +m[4], +m[5], +m[6]);
    }
  }
  return undefined;
}

const formatMillisecond = timeFormat('.%L'),
  formatSecond = timeFormat(':%S'),
  formatMinute = timeFormat('%I:%M'),
  formatHour = timeFormat('%I %p'),
  formatDay = timeFormat('%a %d'),
  formatWeek = timeFormat('%b %d'),
  formatMonth = timeFormat('%b'),
  formatYear = timeFormat('%Y');

export function multiScaleTimeFormat(date: Date) {
  return (timeSecond(date) < date
    ? formatMillisecond
    : timeMinute(date) < date
    ? formatSecond
    : timeHour(date) < date
    ? formatMinute
    : timeDay(date) < date
    ? formatHour
    : timeMonth(date) < date
    ? timeWeek(date) < date
      ? formatDay
      : formatWeek
    : timeYear(date) < date
    ? formatMonth
    : formatYear)(date);
}

export enum TimeGranularityKey {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export interface TimeGranularity {
  key: TimeGranularityKey;
  order: number;
  interval: TimeInterval;
  format: (date: Date) => string;
}

const preferredLocale = navigator.languages ? navigator.languages[0] : 'en';

export const TIME_GRANULARITIES: TimeGranularity[] = [
  { order: 0, key: TimeGranularityKey.SECOND, interval: timeSecond, format: formatSecond },
  { order: 1, key: TimeGranularityKey.MINUTE, interval: timeMinute, format: formatMinute },
  {
    order: 2,
    key: TimeGranularityKey.HOUR,
    interval: timeHour,
    format: (d: Date) => d.toLocaleString(preferredLocale, { hour: 'numeric', minute: '2-digit' }),
  },
  { order: 3, key: TimeGranularityKey.DAY, interval: timeDay, format: formatDay },
  { order: 4, key: TimeGranularityKey.MONTH, interval: timeMonth, format: formatMonth },
  { order: 5, key: TimeGranularityKey.YEAR, interval: timeYear, format: formatYear },
];

export function getTimeGranularityByOrder(order: number) {
  return TIME_GRANULARITIES.find((s) => s.order === order);
}

export function getTimeGranularityForDate(date: Date) {
  let prev = undefined;
  for (const current of TIME_GRANULARITIES) {
    const { interval } = current;
    const floored = interval(date);
    if (floored < date) {
      if (!prev) return current;
      return prev;
    }
    prev = current;
  }
  return TIME_GRANULARITIES[TIME_GRANULARITIES.length - 1];
}

export function areRangesEqual(a: [Date, Date] | undefined, b: [Date, Date] | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}
