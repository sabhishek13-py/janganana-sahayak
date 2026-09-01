import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BASELINE_BY_CODE, CENSUS_2011_BASELINES, INDIA_2011 } from '@/data/census2011';
import { TERRITORIES } from '@/data/census2027';
import { baselineSchema } from '@/data/schema';
import { INSIGHT_ANSWER, jsonResponse } from '@/test/__fixtures__/model-replies';
import { enMessages, renderWithIntl } from '@/test/render-with-intl';

import { InsightQuery } from '../components/insight-query';
import { literacySeries, populationSeries } from '../lib/chart-data';
import {
  ALL_PROJECTIONS,
  DECELERATION_POINTS_PER_DECADE,
  INDIA_PROJECTION_2027,
  projectPopulation,
} from '../lib/projections';

describe('REQ-5 baseline dataset', () => {
  it('has a Census 2011 baseline for every one of the 36 territories', () => {
    expect(CENSUS_2011_BASELINES).toHaveLength(36);
    for (const territory of TERRITORIES) {
      expect(BASELINE_BY_CODE.get(territory.code)).toBeDefined();
    }
  });

  it('passes its schema and stays within believable bounds', () => {
    for (const baseline of CENSUS_2011_BASELINES) {
      expect(() => baselineSchema.parse(baseline)).not.toThrow();
      expect(baseline.literacyRate2011).toBeGreaterThan(50);
      expect(baseline.urbanSharePct2011).toBeLessThanOrEqual(100);
    }
  });

  it('sums to within 0.1 per cent of the published all-India total', () => {
    const total = CENSUS_2011_BASELINES.reduce((sum, b) => sum + b.population2011, 0);
    const drift = Math.abs(total - INDIA_2011.population) / INDIA_2011.population;
    expect(drift).toBeLessThan(0.001);
  });

  it('marks units that did not exist separately in 2011 as apportioned', () => {
    const apportioned = CENSUS_2011_BASELINES.filter(
      (b) => b.provenance === 'APPORTIONED_FROM_2011',
    ).map((b) => b.code);
    expect(apportioned.sort()).toEqual(['AP', 'JK', 'LA', 'TG']);
  });
});

describe('REQ-5 projections are labelled estimates', () => {
  it('flags every projection as an estimate', () => {
    expect(ALL_PROJECTIONS).toHaveLength(36);
    for (const projection of ALL_PROJECTIONS) {
      expect(projection.isEstimate).toBe(true);
    }
  });

  it('decelerates growth rather than extrapolating the 2001-2011 rate flat', () => {
    const baseline = BASELINE_BY_CODE.get('UP');
    if (baseline === undefined) throw new Error('UP baseline missing');
    const projection = projectPopulation(baseline);
    expect(projection.decadalRate2011To2021Pct).toBeCloseTo(
      baseline.decadalGrowthPct2001To2011 - DECELERATION_POINTS_PER_DECADE,
      2,
    );
    const naive = baseline.population2011 * (1 + baseline.decadalGrowthPct2001To2011 / 100) ** 1.6;
    expect(projection.projected2027).toBeLessThan(naive);
  });

  it('never lets a decelerated rate go negative', () => {
    const projection = projectPopulation({
      code: 'ZZ',
      population2011: 1_000_000,
      literacyRate2011: 70,
      urbanSharePct2011: 20,
      decadalGrowthPct2001To2011: -0.6,
      sexRatio2011: 940,
      provenance: 'CENSUS_2011',
    });
    expect(projection.decadalRate2011To2021Pct).toBe(0);
    expect(projection.projected2027).toBe(1_000_000);
  });

  it('produces a national 2027 estimate in a plausible range', () => {
    expect(INDIA_PROJECTION_2027.projected2027).toBeGreaterThan(1_350_000_000);
    expect(INDIA_PROJECTION_2027.projected2027).toBeLessThan(1_550_000_000);
  });
});

describe('REQ-5 chart data and text equivalents', () => {
  it('sorts literacy descending, with Kerala highest', () => {
    expect(literacySeries[0]?.code).toBe('KL');
    for (let index = 1; index < literacySeries.length; index += 1) {
      const previous = literacySeries[index - 1]?.value ?? 0;
      expect(literacySeries[index]?.value ?? 0).toBeLessThanOrEqual(previous);
    }
  });

  it('pairs each population row with its 2027 estimate', () => {
    for (const datum of populationSeries) {
      expect(datum.secondary).toBeGreaterThan(0);
    }
  });

  it('gives every chart a sentence that carries the same point', () => {
    const summaries = Object.entries(enMessages.insights)
      .filter(([key]) => key.startsWith('summary'))
      .map(([, value]) => value);
    expect(summaries).toHaveLength(5);
    for (const summary of summaries) {
      expect(summary.length).toBeGreaterThan(40);
    }
    expect(enMessages.insights.summaryPopulation).toMatch(/not official figures/i);
  });
});

describe('REQ-5 natural-language query', () => {
  it('answers from the baselines and names the chart that shows it', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(INSIGHT_ANSWER));
    renderWithIntl(<InsightQuery />);

    await user.type(screen.getByLabelText(/Ask a question about this data/), 'Highest literacy?');
    await user.click(screen.getByRole('button', { name: 'Answer' }));

    await waitFor(() => {
      expect(screen.getByText(INSIGHT_ANSWER.answer)).toBeInTheDocument();
    });
    expect(screen.getByText(/Literacy rate by State, 2011/)).toBeInTheDocument();
  });

  it('labels a projection answer as an estimate', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ ...INSIGHT_ANSWER, isProjection: true }),
    );
    renderWithIntl(<InsightQuery />);

    await user.type(screen.getByLabelText(/Ask a question about this data/), 'What about 2027?');
    await user.click(screen.getByRole('button', { name: 'Answer' }));

    await waitFor(() => {
      expect(screen.getByText('Projection, not an official figure')).toBeInTheDocument();
    });
  });
});
