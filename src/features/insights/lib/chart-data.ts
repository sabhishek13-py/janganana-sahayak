import { CENSUS_2011_BASELINES, INDIA_2011, INDIA_AGE_STRUCTURE_2011 } from '@/data/census2011';
import { TERRITORY_BY_CODE } from '@/data/census2027';

import { PROJECTION_BY_CODE } from './projections';

export interface ChartDatum {
  readonly name: string;
  readonly code: string;
  readonly value: number;
  readonly secondary?: number;
}

const nameOf = (code: string): string => TERRITORY_BY_CODE.get(code)?.name ?? code;

const byValueDescending = (a: ChartDatum, b: ChartDatum): number => b.value - a.value;

export const literacySeries: readonly ChartDatum[] = Object.freeze(
  CENSUS_2011_BASELINES.map((baseline) => ({
    name: nameOf(baseline.code),
    code: baseline.code,
    value: baseline.literacyRate2011,
  })).sort(byValueDescending),
);

export const urbanRuralSeries: readonly ChartDatum[] = Object.freeze(
  CENSUS_2011_BASELINES.map((baseline) => ({
    name: nameOf(baseline.code),
    code: baseline.code,
    value: baseline.urbanSharePct2011,
    secondary: Number((100 - baseline.urbanSharePct2011).toFixed(1)),
  })).sort(byValueDescending),
);

export const decadalGrowthSeries: readonly ChartDatum[] = Object.freeze(
  CENSUS_2011_BASELINES.map((baseline) => ({
    name: nameOf(baseline.code),
    code: baseline.code,
    value: baseline.decadalGrowthPct2001To2011,
  })).sort(byValueDescending),
);

export const ageStructureSeries: readonly ChartDatum[] = Object.freeze(
  INDIA_AGE_STRUCTURE_2011.map((band) => ({
    name: band.band,
    code: band.band,
    value: band.sharePct,
  })),
);

/** 2011 actual beside the app's 2027 estimate, in millions for legibility. */
export const populationSeries: readonly ChartDatum[] = Object.freeze(
  CENSUS_2011_BASELINES.map((baseline) => ({
    name: nameOf(baseline.code),
    code: baseline.code,
    value: Number((baseline.population2011 / 1_000_000).toFixed(2)),
    secondary: Number(
      ((PROJECTION_BY_CODE.get(baseline.code)?.projected2027 ?? 0) / 1_000_000).toFixed(2),
    ),
  })).sort(byValueDescending),
);

const top = (series: readonly ChartDatum[]): ChartDatum | undefined => series[0];
const bottom = (series: readonly ChartDatum[]): ChartDatum | undefined => series.at(-1);

/**
 * The values that go into each chart's one-sentence text equivalent.
 *
 * Only the numbers and the State names live here. The sentence itself is a
 * translated message, because this summary is the accessible equivalent of the
 * chart — a reader who cannot use the visual gets this instead, and in an app
 * offered in thirteen languages that cannot be the one part written only in
 * English.
 */
export const SUMMARY_VALUES = {
  literacy: {
    india: INDIA_2011.literacyRate,
    top: top(literacySeries)?.name ?? '',
    topValue: top(literacySeries)?.value ?? 0,
    bottom: bottom(literacySeries)?.name ?? '',
    bottomValue: bottom(literacySeries)?.value ?? 0,
  },
  urbanRural: {
    india: INDIA_2011.urbanSharePct,
    top: top(urbanRuralSeries)?.name ?? '',
    topValue: top(urbanRuralSeries)?.value ?? 0,
    bottom: bottom(urbanRuralSeries)?.name ?? '',
    bottomValue: bottom(urbanRuralSeries)?.value ?? 0,
  },
  decadalGrowth: {
    india: INDIA_2011.decadalGrowthPct,
    top: top(decadalGrowthSeries)?.name ?? '',
    topValue: top(decadalGrowthSeries)?.value ?? 0,
    bottom: bottom(decadalGrowthSeries)?.name ?? '',
    bottomValue: bottom(decadalGrowthSeries)?.value ?? 0,
  },
  ageStructure: {
    young: ageStructureSeries[0]?.value ?? 0,
    working: ageStructureSeries[1]?.value ?? 0,
    older: ageStructureSeries[2]?.value ?? 0,
  },
} as const;
