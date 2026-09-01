'use client';
// Interactive: shows the grounded answer and which chart illustrates it.

import { useTranslations } from 'next-intl';

import { Callout } from '@/components/ui/callout';
import type { InsightAnswer } from '@/lib/ai/contracts';

import type { QueryStatus } from '../hooks/use-insight-answer';

/**
 * The chart the model named, mapped to that chart's own title. `population`
 * previously pointed at `chartPyramid` — the age-structure chart — so an answer
 * about population sent the reader to the wrong figure.
 */
const CHART_LABELS = {
  literacy: 'chartLiteracy',
  urbanRural: 'chartUrbanRural',
  decadalGrowth: 'chartGrowth',
  population: 'chartPopulation',
} as const;

export interface InsightAnswerPanelProps {
  readonly answer: InsightAnswer | undefined;
  readonly status: QueryStatus;
}

export function InsightAnswerPanel({ answer, status }: InsightAnswerPanelProps) {
  const t = useTranslations('insights');
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');

  return (
    <div role="status" aria-live="polite" aria-label={a11y('liveAnswer')}>
      {status === 'failed' && <Callout tone="danger">{common('error')}</Callout>}
      {answer !== undefined && (
        <Callout tone={answer.isProjection ? 'warn' : 'info'}>
          <p>{answer.answer}</p>
          <p className="mt-2 text-xs">
            {t('explainChart')}: {t(CHART_LABELS[answer.chartId])}
          </p>
          {answer.isProjection && <p className="mt-1 text-xs">{t('projectionNote')}</p>}
          {answer.groundedIn.length > 0 && (
            <p className="mt-1 text-xs">
              {common('source')}: {answer.groundedIn.join('; ')}
            </p>
          )}
        </Callout>
      )}
    </div>
  );
}
