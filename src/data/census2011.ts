import { baselineSchema, type StateBaseline } from './schema';

/**
 * Census of India 2011 baselines, used as the comparison point for 2027.
 *
 * Telangana and Ladakh did not exist as separate units in 2011: their rows are
 * apportioned from undivided Andhra Pradesh and undivided Jammu and Kashmir.
 * Those rows are marked APPORTIONED and the UI labels them as such.
 */
export type BaselineProvenance = 'CENSUS_2011' | 'APPORTIONED_FROM_2011';

export interface Baseline extends StateBaseline {
  readonly provenance: BaselineProvenance;
}

type Row = readonly [
  code: string,
  population: number,
  literacy: number,
  urbanPct: number,
  growthPct: number,
  sexRatio: number,
  provenance?: BaselineProvenance,
];

const ROWS: readonly Row[] = [
  ['AP', 49_386_799, 67.0, 33.4, 11.0, 993, 'APPORTIONED_FROM_2011'],
  ['AR', 1_383_727, 65.4, 22.9, 26.0, 938],
  ['AS', 31_205_576, 72.2, 14.1, 17.1, 958],
  ['BR', 104_099_452, 61.8, 11.3, 25.4, 918],
  ['CT', 25_545_198, 70.3, 23.2, 22.6, 991],
  ['GA', 1_458_545, 88.7, 62.2, 8.2, 973],
  ['GJ', 60_439_692, 78.0, 42.6, 19.3, 919],
  ['HR', 25_351_462, 75.6, 34.9, 19.9, 879],
  ['HP', 6_864_602, 82.8, 10.0, 12.9, 972],
  ['JH', 32_988_134, 66.4, 24.1, 22.4, 948],
  ['KA', 61_095_297, 75.4, 38.6, 15.6, 973],
  ['KL', 33_406_061, 94.0, 47.7, 4.9, 1084],
  ['MP', 72_626_809, 69.3, 27.6, 20.3, 931],
  ['MH', 112_374_333, 82.3, 45.2, 16.0, 929],
  ['MN', 2_570_390, 76.9, 30.2, 18.7, 985],
  ['ML', 2_966_889, 74.4, 20.1, 27.9, 989],
  ['MZ', 1_097_206, 91.3, 52.1, 23.5, 976],
  ['NL', 1_978_502, 79.6, 28.9, -0.6, 931],
  ['OR', 41_974_218, 72.9, 16.7, 14.0, 979],
  ['PB', 27_743_338, 75.8, 37.5, 13.9, 895],
  ['RJ', 68_548_437, 66.1, 24.9, 21.3, 928],
  ['SK', 610_577, 81.4, 25.0, 12.9, 890],
  ['TN', 72_147_030, 80.1, 48.4, 15.6, 996],
  ['TG', 35_193_978, 66.5, 38.9, 13.6, 988, 'APPORTIONED_FROM_2011'],
  ['TR', 3_673_917, 87.2, 26.2, 14.8, 960],
  ['UP', 199_812_341, 67.7, 22.3, 20.2, 912],
  ['UT', 10_086_292, 78.8, 30.6, 18.8, 963],
  ['WB', 91_276_115, 76.3, 31.9, 13.8, 950],
  ['AN', 380_581, 86.6, 37.7, 6.9, 876],
  ['CH', 1_055_450, 86.1, 97.3, 17.2, 818],
  ['DH', 586_956, 76.2, 46.0, 55.9, 774],
  ['DL', 16_787_941, 86.2, 97.5, 21.2, 868],
  ['JK', 12_267_013, 67.2, 27.4, 23.6, 889, 'APPORTIONED_FROM_2011'],
  ['LA', 274_289, 76.0, 23.0, 13.9, 690, 'APPORTIONED_FROM_2011'],
  ['LD', 64_473, 91.9, 78.1, 6.3, 946],
  ['PY', 1_247_953, 85.9, 68.3, 28.1, 1037],
];

export const CENSUS_2011_BASELINES: readonly Baseline[] = Object.freeze(
  ROWS.map(([code, population, literacy, urban, growth, sexRatio, provenance]) => ({
    ...baselineSchema.parse({
      code,
      population2011: population,
      literacyRate2011: literacy,
      urbanSharePct2011: urban,
      decadalGrowthPct2001To2011: growth,
      sexRatio2011: sexRatio,
    }),
    provenance: provenance ?? 'CENSUS_2011',
  })),
);

export const BASELINE_BY_CODE: ReadonlyMap<string, Baseline> = new Map(
  CENSUS_2011_BASELINES.map((baseline) => [baseline.code, baseline]),
);

/** India totals from Census 2011, used for the national summary. */
export const INDIA_2011 = Object.freeze({
  population: 1_210_854_977,
  literacyRate: 74.04,
  urbanSharePct: 31.16,
  decadalGrowthPct: 17.7,
  sexRatio: 943,
});

/**
 * Broad age structure of India at Census 2011. Only the three bands that are
 * firmly documented are modelled; a finer age-by-sex pyramid is deliberately not
 * shown, because inventing the intermediate bands would misrepresent the source.
 */
export const INDIA_AGE_STRUCTURE_2011: readonly {
  readonly band: string;
  readonly sharePct: number;
}[] = Object.freeze([
  { band: '0 to 14', sharePct: 30.8 },
  { band: '15 to 59', sharePct: 60.6 },
  { band: '60 and above', sharePct: 8.6 },
]);
