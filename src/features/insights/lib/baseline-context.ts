import { CENSUS_2011_BASELINES, INDIA_2011 } from '@/data/census2011';
import { TERRITORY_BY_CODE } from '@/data/census2027';

const nameOf = (code: string): string => TERRITORY_BY_CODE.get(code)?.name ?? code;

/** Compact, machine-readable baselines for the grounded natural-language query route. */
export const CENSUS_2011_BASELINES_TEXT = [
  'CENSUS 2011 BASELINES (official figures; the only numbers you may quote):',
  `- India: population ${INDIA_2011.population}, literacy ${INDIA_2011.literacyRate}%, urban ${INDIA_2011.urbanSharePct}%, decadal growth ${INDIA_2011.decadalGrowthPct}%, sex ratio ${INDIA_2011.sexRatio}`,
  ...CENSUS_2011_BASELINES.map(
    (baseline) =>
      `- ${nameOf(baseline.code)}: population ${baseline.population2011}, literacy ${baseline.literacyRate2011}%, urban ${baseline.urbanSharePct2011}%, decadal growth ${baseline.decadalGrowthPct2001To2011}%, sex ratio ${baseline.sexRatio2011}${baseline.provenance === 'APPORTIONED_FROM_2011' ? ' (apportioned: this unit did not exist separately in 2011)' : ''}`,
  ),
  'Any 2027 number is a projection, never an official figure.',
].join('\n');
