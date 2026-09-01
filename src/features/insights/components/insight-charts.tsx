'use client';
// Interactive: chart visuals load after hydration; summaries and tables do not.

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import {
  ageStructureSeries,
  decadalGrowthSeries,
  literacySeries,
  populationSeries,
  SUMMARY_VALUES,
  urbanRuralSeries,
  type ChartDatum,
} from '../lib/chart-data';
import { DECELERATION_POINTS_PER_DECADE } from '../lib/projections';

import { ChartCard } from './chart-card';
import { LazyHorizontalBars, LazyPairedBars } from './lazy-visuals';

/** Every user-visible string on this page comes from the catalog, not from here. */
type InsightKey = Parameters<ReturnType<typeof useTranslations<'insights'>>>[0];

interface ChartSpec {
  readonly id: string;
  readonly titleKey: InsightKey;
  readonly summary: ReactNode;
  readonly data: readonly ChartDatum[];
  readonly valueLabelKey: InsightKey;
  readonly secondaryLabelKey?: InsightKey;
  readonly isEstimate?: boolean;
  readonly narration?: ReactNode;
  readonly visual: ReactNode;
}

type Translate = ReturnType<typeof useTranslations<'insights'>>;

/** The three straight Census 2011 baselines. Built per render: every label is a message. */
function baselineSpecs(t: Translate): readonly ChartSpec[] {
  return [
    {
      id: 'literacy',
      titleKey: 'chartLiteracy',
      summary: t('summaryLiteracy', SUMMARY_VALUES.literacy),
      data: literacySeries,
      valueLabelKey: 'axisLiteracy',
      visual: <LazyHorizontalBars data={literacySeries} unit="%" />,
    },
    {
      id: 'urban-rural',
      titleKey: 'chartUrbanRural',
      summary: t('summaryUrbanRural', SUMMARY_VALUES.urbanRural),
      data: urbanRuralSeries,
      valueLabelKey: 'axisUrban',
      secondaryLabelKey: 'axisRural',
      visual: (
        <LazyPairedBars
          data={urbanRuralSeries}
          firstLabel={t('legendUrban')}
          secondLabel={t('legendRural')}
        />
      ),
    },
    {
      id: 'growth',
      titleKey: 'chartGrowth',
      summary: t('summaryGrowth', SUMMARY_VALUES.decadalGrowth),
      data: decadalGrowthSeries,
      valueLabelKey: 'axisGrowth',
      visual: <LazyHorizontalBars data={decadalGrowthSeries} unit="%" />,
    },
  ];
}

/** The age split, and the one chart that carries this app's own 2027 estimate. */
function estimateSpecs(t: Translate): readonly ChartSpec[] {
  return [
    {
      id: 'age',
      titleKey: 'chartPyramid',
      summary: t('summaryAge', SUMMARY_VALUES.ageStructure),
      data: ageStructureSeries,
      valueLabelKey: 'axisAgeShare',
      visual: <LazyHorizontalBars data={ageStructureSeries} unit="%" />,
    },
    {
      id: 'population',
      titleKey: 'chartPopulation',
      summary: t('summaryPopulation'),
      data: populationSeries,
      valueLabelKey: 'axisPopulation2011',
      secondaryLabelKey: 'axisPopulation2027',
      isEstimate: true,
      narration: (
        <p className="text-xs text-ink-subtle">
          {t('projectionMethod', { points: DECELERATION_POINTS_PER_DECADE })}
        </p>
      ),
      visual: (
        <LazyPairedBars
          data={populationSeries}
          firstLabel={t('legend2011')}
          secondLabel={t('legend2027')}
        />
      ),
    },
  ];
}

export function InsightCharts() {
  const t = useTranslations('insights');
  const specs = [...baselineSpecs(t), ...estimateSpecs(t)];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {specs.map((spec) => (
        <ChartCard
          key={spec.id}
          title={t(spec.titleKey)}
          summary={spec.summary}
          data={spec.data}
          valueLabel={t(spec.valueLabelKey)}
          secondaryLabel={
            spec.secondaryLabelKey === undefined ? undefined : t(spec.secondaryLabelKey)
          }
          isEstimate={spec.isEstimate ?? false}
          narration={spec.narration}
        >
          {spec.visual}
        </ChartCard>
      ))}
    </div>
  );
}
