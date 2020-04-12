import { isoParse, utcFormat, utcParse } from 'd3-time-format';
import {
  timeDay,
  timeHour,
  timeMinute,
  timeMonth,
  timeSecond,
  timeWeek,
  timeYear,
  utcDay,
  utcHour,
  utcMillisecond,
  utcMinute,
  utcMonth,
  utcSecond,
  utcWeek,
  utcYear,
} from 'd3-time';

const dateParsers = [isoParse, utcParse('%Y-%m-%d %H:%M:%S'), utcParse('%Y-%m-%d %H:%M')];

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

const formatMillisecond = utcFormat('.%L'),
  formatSecond = utcFormat(':%S'),
  formatMinute = utcFormat('%I:%M'),
  formatHour = utcFormat('%I %p'),
  formatDay = utcFormat('%a %d'),
  formatWeek = utcFormat('%b %d'),
  formatMonth = utcFormat('%B'),
  formatYear = utcFormat('%Y');

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

export const TIME_INTERVALS = [
  utcMillisecond,
  utcSecond,
  utcMinute,
  utcHour,
  utcDay,
  utcWeek,
  utcMonth,
  utcYear,
];

export function getTimePrecisionIntervalIndex(date: Date) {
  for (let i = 0; i < TIME_INTERVALS.length - 1; i++) {
    if (TIME_INTERVALS[i + 1](date) < date) {
      return i;
    }
  }
  return TIME_INTERVALS.length - 1;
}
