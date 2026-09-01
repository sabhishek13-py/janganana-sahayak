import { describe, expect, it } from 'vitest';

import { CENSUS_2027, TERRITORIES, territorySchema } from '@/data/census2027';

import {
  countdownTo,
  daysBetween,
  formatIsoMonth,
  shiftDays,
  windowLengthDays,
  windowPhase,
} from '../lib/dates';
import { buildScheduleIcs, icsFileName } from '../lib/ics';
import {
  ALL_SCHEDULES,
  deriveSelfEnumerationWindow,
  NOTIFIED_COUNT,
  populationEnumerationFor,
  resolveSchedule,
  searchTerritories,
} from '../lib/schedule-lookup';

describe('REQ-2 ground-truth dataset shape', () => {
  it('models all 36 States and Union Territories exactly once', () => {
    expect(TERRITORIES).toHaveLength(36);
    expect(new Set(TERRITORIES.map((t) => t.code)).size).toBe(36);
    expect(TERRITORIES.filter((t) => t.kind === 'STATE')).toHaveLength(28);
    expect(TERRITORIES.filter((t) => t.kind === 'UNION_TERRITORY')).toHaveLength(8);
  });

  it('every territory still satisfies its schema', () => {
    for (const territory of TERRITORIES) {
      expect(() => territorySchema.parse(territory)).not.toThrow();
    }
  });

  it('never invents a window: unnotified territories carry nulls', () => {
    for (const territory of TERRITORIES) {
      if (territory.status === 'AWAITING_STATE_NOTIFICATION') {
        expect(territory.houselisting).toBeNull();
        expect(territory.selfEnumeration).toBeNull();
      }
    }
  });

  it('states Phase II questions are not yet notified rather than guessing them', () => {
    expect(CENSUS_2027.populationEnumeration.questionsNotified).toBe(false);
    expect(CENSUS_2027.populationEnumeration.casteEnumeration).toBe(true);
    expect(CENSUS_2027.populationEnumeration.lastCasteEnumerationYear).toBe(1931);
  });
});

describe('REQ-2 schedule lookup for every State/UT', () => {
  it('resolves a schedule for all 36 codes', () => {
    expect(ALL_SCHEDULES).toHaveLength(36);
    for (const territory of TERRITORIES) {
      expect(resolveSchedule(territory.code)).toBeDefined();
    }
  });

  it('returns undefined for an unknown code', () => {
    expect(resolveSchedule('ZZ')).toBeUndefined();
  });

  it('exposes the eight notified State/UT windows', () => {
    const notified = ALL_SCHEDULES.filter((s) => s.status === 'NOTIFIED').map(
      (s) => s.territory.code,
    );
    expect(notified.sort()).toEqual(['AN', 'GA', 'KA', 'LD', 'MN', 'MZ', 'OR', 'SK']);
    expect(NOTIFIED_COUNT).toBe(notified.length);
  });

  it('keeps Delhi awaiting notification while listing its notified sub-areas', () => {
    const delhi = resolveSchedule('DL');
    expect(delhi?.status).toBe('AWAITING_STATE_NOTIFICATION');
    expect(delhi?.subAreas.map((a) => a.name)).toEqual(['NDMC area', 'Delhi Cantonment']);
  });

  it('finds territories and their sub-areas by search', () => {
    expect(searchTerritories('goa').map((s) => s.territory.code)).toEqual(['GA']);
    expect(searchTerritories('cantonment').map((s) => s.territory.code)).toEqual(['DL']);
    expect(searchTerritories('')).toHaveLength(36);
  });
});

describe('REQ-2 window boundary maths', () => {
  it('derives the 15-day self-enumeration window that precedes houselisting', () => {
    const derived = deriveSelfEnumerationWindow({ start: '2026-04-16', end: '2026-05-15' });
    expect(derived).toEqual({ start: '2026-04-01', end: '2026-04-15' });
    expect(windowLengthDays(derived)).toBe(CENSUS_2027.selfEnumeration.windowDays);
  });

  it('matches every notified window against the derivation rule', () => {
    for (const schedule of ALL_SCHEDULES) {
      if (schedule.houselisting === null || schedule.territory.selfEnumeration === null) continue;
      expect(schedule.territory.selfEnumeration).toEqual(
        deriveSelfEnumerationWindow(schedule.houselisting),
      );
      expect(windowLengthDays(schedule.houselisting)).toBe(
        CENSUS_2027.houselisting.perTerritoryWindowDays,
      );
    }
  });

  it('keeps every notified houselisting window inside the national window', () => {
    const national = CENSUS_2027.houselisting.nationalWindow;
    for (const schedule of ALL_SCHEDULES) {
      if (schedule.houselisting === null) continue;
      expect(schedule.houselisting.start >= national.start).toBe(true);
      expect(schedule.houselisting.end <= national.end).toBe(true);
    }
  });

  it('classifies a window as before, open or after on its exact edges', () => {
    const window = { start: '2026-04-01', end: '2026-04-15' };
    expect(windowPhase(window, '2026-03-31')).toBe('BEFORE');
    expect(windowPhase(window, '2026-04-01')).toBe('OPEN');
    expect(windowPhase(window, '2026-04-15')).toBe('OPEN');
    expect(windowPhase(window, '2026-04-16')).toBe('AFTER');
  });

  it('counts down to the opening, then to the close, then stops', () => {
    const window = { start: '2026-04-01', end: '2026-04-15' };
    // Windows are Indian civil dates, so the countdown targets IST midnight:
    // 00:00 on 30 March UTC is already 05:30 that morning in India, leaving one
    // day and 18.5 hours until the window opens.
    expect(countdownTo(window, new Date('2026-03-30T00:00:00Z'))).toMatchObject({
      phase: 'BEFORE',
      days: 1,
      hours: 18,
      minutes: 30,
    });
    expect(countdownTo(window, new Date('2026-04-14T00:00:00Z'))).toMatchObject({
      phase: 'OPEN',
      days: 1,
    });
    // The turn happens at IST midnight, not at 05:30 IST as it did on UTC days.
    expect(countdownTo(window, new Date('2026-03-31T18:00:00Z')).phase).toBe('BEFORE');
    expect(countdownTo(window, new Date('2026-03-31T19:00:00Z')).phase).toBe('OPEN');
    expect(countdownTo(window, new Date('2026-05-01T00:00:00Z'))).toEqual({
      phase: 'AFTER',
      days: 0,
      hours: 0,
      minutes: 0,
    });
  });

  it('does day maths across a leap day and a year boundary', () => {
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
    expect(shiftDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(formatIsoMonth('2027-02')).toBe('February 2027');
  });
});

describe('REQ-2 snow-bound Phase II exceptions', () => {
  it('advances Ladakh entirely to September 2026', () => {
    const ladakh = resolveSchedule('LA');
    expect(ladakh?.populationEnumeration).toEqual([
      { area: 'ALL', month: '2026-09', referenceDate: '2026-10-01' },
    ]);
  });

  it('splits J&K, Himachal Pradesh and Uttarakhand into two timetables', () => {
    for (const code of ['JK', 'HP', 'UT']) {
      const plans = resolveSchedule(code)?.populationEnumeration ?? [];
      expect(plans).toHaveLength(2);
      expect(plans[0]).toEqual({
        area: 'SNOW_BOUND_AREAS',
        month: '2026-09',
        referenceDate: '2026-10-01',
      });
      expect(plans[1]).toEqual({
        area: 'REST_OF_TERRITORY',
        month: '2027-02',
        referenceDate: '2027-03-01',
      });
    }
  });

  it('gives every other territory the national February 2027 timetable', () => {
    const national = TERRITORIES.filter((t) => t.phaseTwoTrack === 'NATIONAL');
    expect(national).toHaveLength(32);
    for (const territory of national) {
      expect(populationEnumerationFor(territory)).toEqual([
        { area: 'ALL', month: '2027-02', referenceDate: '2027-03-01' },
      ]);
    }
  });
});

describe('REQ-2 calendar export', () => {
  const goa = resolveSchedule('GA');

  it('emits a valid two-event calendar with CRLF endings and no personal data', () => {
    if (goa === undefined) throw new Error('Goa must resolve');
    const ics = buildScheduleIcs(goa, new Date('2026-01-01T00:00:00Z'));
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260401');
    // DTEND is exclusive, so a window ending 15 April is written as the 16th.
    expect(ics).toContain('DTEND;VALUE=DATE:20260416');
    expect(icsFileName(goa)).toBe('census-2027-ga.ics');
  });

  it('emits a calendar with no events when nothing is notified', () => {
    const bihar = resolveSchedule('BR');
    if (bihar === undefined) throw new Error('Bihar must resolve');
    const ics = buildScheduleIcs(bihar, new Date('2026-01-01T00:00:00Z'));
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
