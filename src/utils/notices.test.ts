// The calendar of the home page's notices: the days each one falls on and what it says on them.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RATES } from '../data/carinova.ts';
import { NOTICES, NOTICE_BUFFER_DAYS, type Notice } from '../data/notices.ts';
import { LOCALES, type Locale } from '../i18n/locales.ts';
import { ui as uiAr } from '../i18n/ui/ar.ts';
import { ui as uiEn } from '../i18n/ui/en.ts';
import { ui as uiEs } from '../i18n/ui/es.ts';
import { ui as uiFr } from '../i18n/ui/fr.ts';
import { ui as uiPt } from '../i18n/ui/pt.ts';
import { ui as uiRu } from '../i18n/ui/ru.ts';
import { ui as uiZh } from '../i18n/ui/zh.ts';
import {
  anchorOf,
  cutoffsOf,
  dateOf,
  dayOf,
  isoOf,
  occurrencesOf,
  scheduleOf,
  slotsOn,
  todayInNicaragua,
} from './notices.ts';

const UI = { es: uiEs, en: uiEn, fr: uiFr, pt: uiPt, zh: uiZh, ru: uiRu, ar: uiAr } satisfies Record<Locale, unknown>;

const cutoffs = cutoffsOf({ air: RATES.air.transitDays, sea: RATES.sea.transitDays }, NOTICE_BUFFER_DAYS);
const notice = (id: string): Notice => {
  const [found] = NOTICES.filter((item) => item.id === id);
  assert.ok(found, id);
  return found;
};
const day = (iso: string): number => {
  const [year, month, date] = iso.split('-').map(Number);
  return dayOf(year, month, date);
};
const on = (id: string, year: number): string => isoOf(anchorOf(notice(id).rule, year));

test('a date is a day number, and back', () => {
  assert.equal(dayOf(1970, 1, 1), 0);
  assert.equal(isoOf(day('2026-11-27')), '2026-11-27');
  assert.deepEqual(dateOf(day('2026-11-27')), { year: 2026, month: 11, day: 27, weekday: 5 });
  // A month that does not exist rolls over: the day before March 1 is the last of February.
  assert.equal(isoOf(dayOf(2028, 3, 1) - 1), '2028-02-29');
});

test('today is the day it is in Nicaragua, six hours behind UTC', () => {
  assert.equal(isoOf(todayInNicaragua(Date.UTC(2026, 10, 19, 5, 59))), '2026-11-18');
  assert.equal(isoOf(todayInNicaragua(Date.UTC(2026, 10, 19, 6, 0))), '2026-11-19');
});

test('the days that move fall where the calendar puts them', () => {
  // Black Friday is the day after the fourth Thursday of November; Cyber Monday, the Monday after.
  assert.equal(on('black-friday', 2026), '2026-11-27');
  assert.equal(on('cyber-monday', 2026), '2026-11-30');
  assert.equal(on('black-friday', 2027), '2027-11-26');
  assert.equal(on('black-friday', 2029), '2029-11-23');
  // The last Monday of May, the first Monday of September, the second Tuesday of July and October.
  assert.equal(on('memorial-day', 2026), '2026-05-25');
  assert.equal(on('memorial-day', 2027), '2027-05-31');
  assert.equal(on('labor-day-us', 2026), '2026-09-07');
  assert.equal(on('prime-day', 2026), '2026-07-14');
  assert.equal(on('prime-big-deal', 2026), '2026-10-13');
  // Easter.
  assert.equal(on('holy-week', 2026), '2026-04-05');
  assert.equal(on('holy-week', 2027), '2027-03-28');
  assert.equal(on('holy-week', 2038), '2038-04-25');
  // Fixed days.
  assert.equal(on('mothers-day', 2027), '2027-05-30');
  assert.equal(on('christmas-sea', 2026), '2026-12-24');
});

test('the last day to reach the warehouse is the longest delivery time plus the days for customs', () => {
  assert.deepEqual(cutoffs, {
    sea: -(RATES.sea.transitDays[1] + NOTICE_BUFFER_DAYS),
    air: -(RATES.air.transitDays[1] + NOTICE_BUFFER_DAYS),
  });
  assert.deepEqual(cutoffs, { sea: -24, air: -8 });
});

test('a notice shows on the days of its window, every year', () => {
  const [friday] = occurrencesOf(notice('black-friday'), day('2026-11-01'), day('2026-11-30'), cutoffs);
  assert.deepEqual([isoOf(friday.start), isoOf(friday.end)], ['2026-11-17', '2026-11-27']);
  // Christmas by sea ends on the last day a package can reach the warehouse by sea; by air starts the day after.
  const [sea] = occurrencesOf(notice('christmas-sea'), day('2026-10-01'), day('2026-12-31'), cutoffs);
  const [air] = occurrencesOf(notice('christmas-air'), day('2026-10-01'), day('2026-12-31'), cutoffs);
  assert.deepEqual([isoOf(sea.start), isoOf(sea.end)], ['2026-11-09', '2026-11-30']);
  assert.deepEqual([isoOf(air.start), isoOf(air.end)], ['2026-12-01', '2026-12-16']);
  // A window that crosses the new year is found from either side.
  const school = occurrencesOf(notice('back-to-school'), day('2026-12-28'), day('2027-01-10'), cutoffs);
  assert.deepEqual(
    school.map((item) => [isoOf(item.start), isoOf(item.end)]),
    [['2027-01-02', '2027-01-24']]
  );
  assert.equal(occurrencesOf(notice('black-friday'), day('2026-12-01'), day('2027-10-31'), cutoffs).length, 0);
});

test('on 18 November 2026 the bar shows Black Friday and then Christmas by sea', () => {
  const today = day('2026-11-18');
  const slots = scheduleOf(NOTICES, today, today + 400, cutoffs);
  const now = slotsOn(slots, today);
  assert.deepEqual(
    now.map((slot) => slot.key),
    ['black-friday@2026-11-27', 'christmas-sea@2026-12-24']
  );
  // Black Friday names its day; Christmas by sea gives the last day in the warehouse.
  assert.deepEqual(now[0].named.map(isoOf), ['2026-11-27']);
  assert.equal(now[0].chip, null);
  assert.deepEqual(now[1].chip, { type: 'deadline', date: day('2026-11-30') });
  // Cyber Monday joins them on the days before it, ahead of both.
  assert.deepEqual(
    slotsOn(slots, day('2026-11-28')).map((slot) => slot.notice.id),
    ['cyber-monday', 'christmas-sea']
  );
  // Nothing that is off shows.
  assert.ok(slots.every((slot) => slot.notice.enabled));
  assert.equal(slotsOn(slots, day('2026-12-25')).length, 0);
  assert.deepEqual(
    slotsOn(slots, day('2026-12-26')).map((slot) => slot.notice.id),
    ['after-christmas']
  );
});

test('a notice with both last days says them while they hold: by sea and by air, then by air, then neither', () => {
  // Mother's Day in Nicaragua, 30 May: shown from 35 to 8 days before.
  const from = day('2027-04-01');
  const slots = scheduleOf([notice('mothers-day')], from, from + 90, cutoffs);
  assert.deepEqual(
    slots.map((slot) => [isoOf(slot.from), isoOf(slot.to), slot.chip?.type ?? 'none']),
    [
      ['2027-04-25', '2027-05-06', 'cutoffs'],
      ['2027-05-07', '2027-05-22', 'cutoffAir'],
    ]
  );
  const [both, onlyAir] = slots;
  assert.deepEqual(both.chip, { type: 'cutoffs', sea: day('2027-05-06'), air: day('2027-05-22') });
  assert.deepEqual(onlyAir.chip, { type: 'cutoffAir', air: day('2027-05-22') });
  // The same notice all along: closing it once closes it for the year.
  assert.equal(both.key, 'mothers-day@2027-05-30');
  assert.equal(onlyAir.key, both.key);
  // A slot that started before the stretch asked for is still found.
  assert.equal(
    slotsOn(scheduleOf([notice('mothers-day')], day('2027-05-10'), day('2027-05-12'), cutoffs), day('2027-05-10'))
      .length,
    1
  );
});

test('a holiday of two days names both', () => {
  const independence = { ...notice('holiday-0914'), enabled: true };
  const [slot] = scheduleOf([independence], day('2026-09-01'), day('2026-09-30'), cutoffs);
  assert.deepEqual([isoOf(slot.from), isoOf(slot.to)], ['2026-09-11', '2026-09-15']);
  assert.deepEqual(slot.named.map(isoOf), ['2026-09-14', '2026-09-15']);
});

test('every notice has its words in every language, and the calendar is whole', () => {
  const ids = NOTICES.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, 'a notice id is repeated');
  for (const locale of LOCALES) {
    const words: Record<string, string> = UI[locale].landing.ann;
    for (const item of NOTICES) {
      assert.ok(words[item.title], `landing.ann.${item.title} (${locale})`);
      assert.ok(words[item.text], `landing.ann.${item.text} (${locale})`);
      // A title that gets its date from the rule does not carry one itself.
      if (item.dated) assert.equal(/\d/.test(words[item.title]), false, `${locale}: ${words[item.title]}`);
    }
    // Every sentence of the dictionary belongs to a notice.
    const used = new Set(NOTICES.flatMap((item) => [item.title, item.text]));
    for (const key of Object.keys(words)) assert.ok(used.has(key), `landing.ann.${key} (${locale}) is not used`);
  }
  for (const item of NOTICES) {
    assert.ok(item.offsets.length > 0, item.id);
    assert.ok(item.priority > 0, item.id);
    // Only a fixed day can be written in a title.
    if (item.dated) assert.equal(item.rule.type, 'fixed', item.id);
    // What reads the last days needs them in its window or its chip, not both ways at once.
    assert.ok(['cutoffs', 'sea', 'air', 'anchor', 'holiday', 'none'].includes(item.chip), item.id);
  }
  // The closures are for Carinova to turn on: none is on by itself.
  assert.ok(NOTICES.filter((item) => item.kind === 'closure').every((item) => !item.enabled));
});
