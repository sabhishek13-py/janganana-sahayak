import { CENSUS_2011_BASELINES, INDIA_2011, type Baseline } from '@/data/census2011';

/** Census 2011 and Census 2027 reference dates are exactly sixteen years apart. */
export const PROJECTION_YEARS = 16;

/**
 * All-India decadal growth fell from 21.54% (1991-2001) to 17.64% (2001-2011),
 * a decline of about 3.9 percentage points. Carrying a naive 2001-2011 rate
 * forward for sixteen years overstates 2027 badly, so each subsequent decade is
 * decelerated by this amount.
 */
export const DECELERATION_POINTS_PER_DECADE = 3.9;

export interface Projection {
  readonly code: string;
  readonly population2011: number;
  readonly projected2021: number;
  readonly projected2027: number;
  readonly decadalRate2011To2021Pct: number;
  /** Always true. Kept explicit so no caller can render a projection unlabelled. */
  readonly isEstimate: true;
}

const decelerate = (rate: number): number => Math.max(0, rate - DECELERATION_POINTS_PER_DECADE);

/**
 * @requirement REQ-5 Visualise census data meaningfully
 * Projects a 2011 population forward under a decelerating decadal growth model.
 * This is a simple extrapolation by this app, not an official projection, and
 * every surface that shows it says so.
 */
export function projectPopulation(baseline: Baseline): Projection {
  const secondDecade = decelerate(baseline.decadalGrowthPct2001To2011);
  const thirdDecade = decelerate(secondDecade);
  const population2021 = baseline.population2011 * (1 + secondDecade / 100);
  // Six years into the third decade, compounding at that decade's rate.
  const population2027 = population2021 * (1 + thirdDecade / 100) ** 0.6;

  return {
    code: baseline.code,
    population2011: baseline.population2011,
    projected2021: Math.round(population2021),
    projected2027: Math.round(population2027),
    decadalRate2011To2021Pct: Number(secondDecade.toFixed(2)),
    isEstimate: true,
  };
}

export const ALL_PROJECTIONS: readonly Projection[] = Object.freeze(
  CENSUS_2011_BASELINES.map(projectPopulation),
);

export const PROJECTION_BY_CODE: ReadonlyMap<string, Projection> = new Map(
  ALL_PROJECTIONS.map((projection) => [projection.code, projection]),
);

/** National estimate, derived the same way from the all-India decadal rate. */
export const INDIA_PROJECTION_2027 = Object.freeze(
  projectPopulation({
    code: 'IN',
    population2011: INDIA_2011.population,
    literacyRate2011: INDIA_2011.literacyRate,
    urbanSharePct2011: INDIA_2011.urbanSharePct,
    decadalGrowthPct2001To2011: INDIA_2011.decadalGrowthPct,
    sexRatio2011: INDIA_2011.sexRatio,
    provenance: 'CENSUS_2011',
  }),
);

/*
 * The wording of this note now lives in the message catalogs as
 * `insights.projectionMethod`, interpolating DECELERATION_POINTS_PER_DECADE, so
 * that a reader in any of the thirteen languages is told how the estimate was
 * made rather than being shown an English paragraph.
 */
