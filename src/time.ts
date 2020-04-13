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

export enum TimeStepKey {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export interface TimeStep {
  key: TimeStepKey;
  order: number;
  interval: TimeInterval;
  format: (date: Date) => string;
}

export const TIME_STEPS: TimeStep[] = [
  { order: 0, key: TimeStepKey.SECOND, interval: timeSecond, format: formatSecond },
  { order: 1, key: TimeStepKey.MINUTE, interval: timeMinute, format: formatMinute },
  { order: 2, key: TimeStepKey.HOUR, interval: timeHour, format: formatHour },
  { order: 3, key: TimeStepKey.DAY, interval: timeDay, format: formatDay },
  { order: 4, key: TimeStepKey.MONTH, interval: timeMonth, format: formatMonth },
  { order: 5, key: TimeStepKey.YEAR, interval: timeYear, format: formatYear },
];

export function getTimeStepByOrder(order: number) {
  return TIME_STEPS.find((s) => s.order === order);
}

export function getTimeStepForDate(date: Date) {
  let prev = undefined;
  for (const current of TIME_STEPS) {
    const { interval } = current;
    const floored = interval(date);
    if (floored < date) {
      if (!prev) return current;
      return prev;
    }
    prev = current;
  }
  return TIME_STEPS[TIME_STEPS.length - 1];
}
