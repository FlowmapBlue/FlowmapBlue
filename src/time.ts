import { isoParse, timeFormat, timeParse } from 'd3-time-format';
import { timeSecond, timeMinute, timeHour, timeDay, timeMonth, timeYear, timeWeek } from 'd3-time';

const dateParsers = [isoParse, timeParse('%Y-%m-%d %H:%M:%S'), timeParse('%Y-%m-%d %H:%M')];

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
  formatMonth = timeFormat('%B'),
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
