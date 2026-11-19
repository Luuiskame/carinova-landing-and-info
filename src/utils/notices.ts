// The calendar of the home page's notices (src/data/notices.ts): on which days each one shows, and
// what it says beside its text on each of them. The page works the next months out when it is built
// and a few lines of script pick today's when it opens, so the bar is there from the first paint.
// Shared with the unit tests (notices.test.ts), which run it on plain Node.
//
// Days are counted as whole days since 1970-01-01, so a date is a number and a week is + 7.
import type { Notice, NoticeRule } from '../data/notices.ts';

const DAY_MS = 86_400_000;

/** The day number of a date. */
export const dayOf = (year: number, month: number, day: number): number =>
  Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);

/** The date of a day number; `weekday` is 0 for Sunday. */
export const dateOf = (day: number): { year: number; month: number; day: number; weekday: number } => {
  const date = new Date(day * DAY_MS);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: date.getUTCDay(),
  };
};

/** "2026-11-27" */
export const isoOf = (day: number): string => new Date(day * DAY_MS).toISOString().slice(0, 10);

/** Hours Nicaragua is behind UTC, all year round (it has no daylight saving). */
export const NICARAGUA_UTC_OFFSET_HOURS = -6;

/** Today in Nicaragua, as a day number. */
export const todayInNicaragua = (now: number = Date.now()): number =>
  Math.floor((now + NICARAGUA_UTC_OFFSET_HOURS * 3_600_000) / DAY_MS);

/** Easter Sunday of a year (the anonymous Gregorian algorithm). */
const easter = (year: number): number => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  return dayOf(year, Math.floor((h + l - 7 * m + 114) / 31), ((h + l - 7 * m + 114) % 31) + 1);
};

/** The n-th `weekday` of a month; n = -1 is the last one. */
const nthWeekday = (year: number, month: number, weekday: number, n: number): number => {
  if (n > 0) {
    const first = dayOf(year, month, 1);
    return first + ((weekday - dateOf(first).weekday + 7) % 7) + (n - 1) * 7;
  }
  const last = dayOf(year, month + 1, 1) - 1;
  return last - ((dateOf(last).weekday - weekday + 7) % 7);
};

/** The day a rule falls on in a year. */
export const anchorOf = (rule: NoticeRule, year: number): number => {
  if (rule.type === 'fixed') return dayOf(year, rule.month, rule.day);
  if (rule.type === 'easter') return easter(year);
  return nthWeekday(year, rule.month, rule.weekday, rule.n) + (rule.shift ?? 0);
};

/** Days before an event that a package has to be in the warehouse, by each way of shipping (negative). */
export interface Cutoffs {
  sea: number;
  air: number;
}

/** The longest delivery time of each way plus the days kept for customs. */
export const cutoffsOf = (transit: { air: [number, number]; sea: [number, number] }, bufferDays: number): Cutoffs => ({
  sea: -(Math.max(...transit.sea) + bufferDays),
  air: -(Math.max(...transit.air) + bufferDays),
});

/** An end of a notice's window in days from its day: a number, "sea", "air" or one of them ± days. */
const offsetOf = (value: number | string, cutoffs: Cutoffs): number => {
  if (typeof value === 'number') return value;
  const match = /^(sea|air)([+-]\d+)?$/.exec(value);
  return match ? cutoffs[match[1] as keyof Cutoffs] + Number(match[2] ?? 0) : 0;
};

export interface Occurrence {
  notice: Notice;
  /** The day itself, and the first and the last day the notice shows. */
  anchor: number;
  start: number;
  end: number;
}

/** The times a notice shows between two days (both included). */
export const occurrencesOf = (notice: Notice, from: number, to: number, cutoffs: Cutoffs): Array<Occurrence> => {
  const found: Array<Occurrence> = [];
  for (let year = dateOf(from).year - 1; year <= dateOf(to).year + 1; year++) {
    const anchor = anchorOf(notice.rule, year);
    const start = anchor + offsetOf(notice.window.from, cutoffs);
    const end = anchor + offsetOf(notice.window.to, cutoffs);
    if (end >= start && end >= from && start <= to) found.push({ notice, anchor, start, end });
  }
  return found;
};

/** What a notice says beside its text on a stretch of days: the last days to reach the warehouse. */
export type ChipFact =
  | { type: 'cutoffs'; sea: number; air: number }
  | { type: 'cutoffAir'; air: number }
  | { type: 'deadline'; date: number }
  | null;

export interface NoticeSlot {
  /** What a visitor dismisses: the notice and its day ("black-friday@2026-11-27"). */
  key: string;
  notice: Notice;
  anchor: number;
  /** The days this slot is shown, both included. */
  from: number;
  to: number;
  chip: ChipFact;
  /** The days named after the title ("Black Friday · viernes, 27 de noviembre"); empty for most. */
  named: Array<number>;
}

/**
 * Every stretch of days between `from` and `to` on which a notice that is on shows, with what it
 * says on it. A notice whose chip changes as its last days pass ("by sea and by air", then "by
 * air", then nothing) is one slot per stretch.
 */
export const scheduleOf = (
  notices: ReadonlyArray<Notice>,
  from: number,
  to: number,
  cutoffs: Cutoffs
): Array<NoticeSlot> =>
  notices
    .filter((notice) => notice.enabled)
    .flatMap((notice) => occurrencesOf(notice, from, to, cutoffs))
    .flatMap(({ notice, anchor, start, end }): Array<NoticeSlot> => {
      const slot = (first: number, last: number, chip: ChipFact): Array<NoticeSlot> =>
        last >= first
          ? [
              {
                key: `${notice.id}@${isoOf(anchor)}`,
                notice,
                anchor,
                from: first,
                to: last,
                chip,
                named: ['anchor', 'holiday'].includes(notice.chip) ? notice.offsets.map((days) => anchor + days) : [],
              },
            ]
          : [];
      if (notice.chip === 'sea' || notice.chip === 'air') {
        return slot(start, end, { type: 'deadline', date: anchor + cutoffs[notice.chip] });
      }
      if (notice.chip !== 'cutoffs') return slot(start, end, null);
      // While a package can still arrive by sea, both last days; then the one by air; then none.
      const sea = anchor + cutoffs.sea;
      const air = anchor + cutoffs.air;
      return [
        ...slot(start, Math.min(end, sea), { type: 'cutoffs', sea, air }),
        ...slot(Math.max(start, sea + 1), Math.min(end, air), { type: 'cutoffAir', air }),
        ...slot(Math.max(start, air + 1), end, null),
      ];
    })
    .filter((slot) => slot.to >= from && slot.from <= to)
    // The order they are shown in when several fall on a day: the most important first.
    .sort((a, b) => b.notice.priority - a.notice.priority || a.from - b.from);

/** The slots of a day, in the order they are shown. */
export const slotsOn = <Slot extends { from: number; to: number }>(
  slots: ReadonlyArray<Slot>,
  day: number
): Array<Slot> => slots.filter((slot) => slot.from <= day && day <= slot.to);
