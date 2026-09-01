import { z } from 'zod';

import { dateWindowSchema, isoDateSchema, isoMonthSchema } from './schema';

export { TERRITORIES, TERRITORY_BY_CODE } from './states';
export { PHASES, PHASE_I, PHASE_II } from './phases';
export * from './schema';

const censusFactsSchema = z.object({
  censusNumber: z.number().int().positive(),
  censusesSinceIndependence: z.number().int().positive(),
  gazetteNotificationDate: isoDateSchema,
  outlayCroreInr: z.number().positive(),
  fieldFunctionaries: z.object({
    approxMin: z.number().int().positive(),
    approxMax: z.number().int().positive(),
    label: z.string().min(1),
  }),
  selfEnumeration: z.object({
    windowDays: z.number().int().positive(),
    portalLanguages: z.number().int().positive(),
    issuesSelfEnumerationId: z.literal(true),
    precedesHouselistingWindow: z.literal(true),
  }),
  houselisting: z.object({
    nationalWindow: dateWindowSchema,
    perTerritoryWindowDays: z.number().int().positive(),
    questionCount: z.number().int().positive(),
    questionsNotifiedOn: isoMonthSchema,
  }),
  populationEnumeration: z.object({
    nationalMonth: isoMonthSchema,
    snowBoundMonth: isoMonthSchema,
    questionsNotified: z.literal(false),
    casteEnumeration: z.literal(true),
    lastCasteEnumerationYear: z.number().int().positive(),
  }),
  referenceDates: z.object({ standard: isoDateSchema, snowBound: isoDateSchema }),
  officialPortalUrl: z.string().url(),
});

/**
 * The single source of truth for every factual claim this app makes about
 * Census 2027. Parsed at module load, then frozen. Nothing downstream may
 * hard-code a census date or figure — it must read it from here.
 */
export const CENSUS_2027 = Object.freeze(
  censusFactsSchema.parse({
    censusNumber: 16,
    censusesSinceIndependence: 8,
    gazetteNotificationDate: '2025-06-16',
    outlayCroreInr: 11718.24,
    fieldFunctionaries: { approxMin: 3_000_000, approxMax: 3_100_000, label: '30–31 lakh' },
    selfEnumeration: {
      windowDays: 15,
      portalLanguages: 16,
      issuesSelfEnumerationId: true,
      precedesHouselistingWindow: true,
    },
    houselisting: {
      nationalWindow: { start: '2026-04-01', end: '2026-09-30' },
      perTerritoryWindowDays: 30,
      questionCount: 33,
      questionsNotifiedOn: '2026-01',
    },
    populationEnumeration: {
      nationalMonth: '2027-02',
      snowBoundMonth: '2026-09',
      questionsNotified: false,
      casteEnumeration: true,
      lastCasteEnumerationYear: 1931,
    },
    referenceDates: { standard: '2027-03-01', snowBound: '2026-10-01' },
    officialPortalUrl: 'https://censusindia.gov.in/',
  }),
);

export type CensusFacts = typeof CENSUS_2027;

/**
 * Areas whose Population Enumeration is advanced to September 2026. Ladakh in
 * full; in the other three only the snow-bound, non-synchronous areas.
 */
export const SNOW_BOUND_NOTE =
  'Ladakh, and the snow-bound non-synchronous areas of Jammu and Kashmir, Himachal Pradesh and Uttarakhand.';
