import {
  CENSUS_2027,
  TERRITORIES,
  TERRITORY_BY_CODE,
  type DateWindow,
  type IsoDate,
  type ScheduleStatus,
  type SubArea,
  type Territory,
} from '@/data/census2027';

import { shiftDays } from './dates';

export type EnumerationArea = 'ALL' | 'SNOW_BOUND_AREAS' | 'REST_OF_TERRITORY';

export interface PopulationEnumerationPlan {
  readonly area: EnumerationArea;
  readonly month: string;
  readonly referenceDate: IsoDate;
}

export interface ResolvedSchedule {
  readonly territory: Territory;
  readonly status: ScheduleStatus;
  readonly selfEnumeration: DateWindow | null;
  readonly houselisting: DateWindow | null;
  readonly populationEnumeration: readonly PopulationEnumerationPlan[];
  readonly subAreas: readonly SubArea[];
}

const { populationEnumeration: pe, referenceDates, selfEnumeration } = CENSUS_2027;

const NATIONAL_PLAN: PopulationEnumerationPlan = {
  area: 'ALL',
  month: pe.nationalMonth,
  referenceDate: referenceDates.standard,
};

const SNOW_BOUND_PLAN: PopulationEnumerationPlan = {
  area: 'ALL',
  month: pe.snowBoundMonth,
  referenceDate: referenceDates.snowBound,
};

const PARTIAL_PLANS: readonly PopulationEnumerationPlan[] = [
  { area: 'SNOW_BOUND_AREAS', month: pe.snowBoundMonth, referenceDate: referenceDates.snowBound },
  { area: 'REST_OF_TERRITORY', month: pe.nationalMonth, referenceDate: referenceDates.standard },
];

/** Which Population Enumeration timetable applies, including the snow-bound exceptions. */
export function populationEnumerationFor(
  territory: Territory,
): readonly PopulationEnumerationPlan[] {
  switch (territory.phaseTwoTrack) {
    case 'SNOW_BOUND':
      return [SNOW_BOUND_PLAN];
    case 'SNOW_BOUND_PARTIAL':
      return PARTIAL_PLANS;
    case 'NATIONAL':
      return [NATIONAL_PLAN];
  }
}

/**
 * Self-enumeration is the 15-day window ending the day before houselisting starts.
 * Used to check the notified windows and to fill in a window that has not been
 * published separately.
 */
export function deriveSelfEnumerationWindow(houselisting: DateWindow): DateWindow {
  const end = shiftDays(houselisting.start, -1);
  return { start: shiftDays(end, -(selfEnumeration.windowDays - 1)), end };
}

/** @requirement REQ-2 State-wise self-enumeration and survey dates */
export function resolveSchedule(code: string): ResolvedSchedule | undefined {
  const territory = TERRITORY_BY_CODE.get(code);
  if (territory === undefined) return undefined;

  const houselisting = territory.houselisting;
  const selfWindow =
    territory.selfEnumeration ??
    (houselisting === null ? null : deriveSelfEnumerationWindow(houselisting));

  return {
    territory,
    status: territory.status,
    selfEnumeration: selfWindow,
    houselisting,
    populationEnumeration: populationEnumerationFor(territory),
    subAreas: territory.subAreas,
  };
}

/** Every territory, resolved once. O(n) over 36 rows, computed at module load. */
export const ALL_SCHEDULES: readonly ResolvedSchedule[] = Object.freeze(
  TERRITORIES.map((territory) => {
    const resolved = resolveSchedule(territory.code);
    if (resolved === undefined) throw new Error(`Unresolvable territory ${territory.code}`);
    return resolved;
  }),
);

/** Case- and diacritic-insensitive prefix/substring match for the searchable table. */
export function searchTerritories(query: string): readonly ResolvedSchedule[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return ALL_SCHEDULES;
  return ALL_SCHEDULES.filter(
    (schedule) =>
      schedule.territory.name.toLowerCase().includes(needle) ||
      schedule.territory.code.toLowerCase() === needle ||
      schedule.subAreas.some((area) => area.name.toLowerCase().includes(needle)),
  );
}

export const NOTIFIED_COUNT = ALL_SCHEDULES.filter((s) => s.status === 'NOTIFIED').length;
