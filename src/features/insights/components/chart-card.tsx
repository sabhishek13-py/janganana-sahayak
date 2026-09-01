'use client';
// Interactive: the charts render client-side and the table can be expanded.

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { StatusChip } from '@/components/ui/callout';

import type { ChartDatum } from '../lib/chart-data';

import { ChartDataTable } from './chart-data-table';

export interface ChartCardProps {
  readonly title: string;
  readonly summary: ReactNode;
  readonly data: readonly ChartDatum[];
  readonly valueLabel: string;
  readonly secondaryLabel?: string;
  readonly isEstimate?: boolean;
  readonly children: ReactNode;
  readonly narration?: ReactNode;
}

/**
 * @requirement REQ-5 Visualise census data meaningfully
 * Every chart ships with a text summary and an accessible data table holding the
 * same numbers, so the visualisation is never the only representation.
 */
/** Title, text equivalent, and the chip saying whether this is a baseline or an estimate. */
function ChartCaption({
  title,
  summary,
  isEstimate,
}: {
  readonly title: string;
  readonly summary: ReactNode;
  readonly isEstimate: boolean;
}) {
  const t = useTranslations('insights');
  return (
    <figcaption className="space-y-2.5 border-b-2 border-line-strong p-5">
      <h3>{title}</h3>
      <p className="accent-quote max-w-[62ch] text-meta leading-[1.6] text-ink-subtle">{summary}</p>
      <StatusChip tone={isEstimate ? 'warn' : 'ok'}>
        {isEstimate ? t('projectionNote') : t('baselineNote')}
      </StatusChip>
    </figcaption>
  );
}

export function ChartCard({
  title,
  summary,
  data,
  valueLabel,
  secondaryLabel,
  isEstimate = false,
  children,
  narration,
}: ChartCardProps) {
  return (
    <figure className="flex flex-col border-2 border-line-strong bg-surface">
      <ChartCaption title={title} summary={summary} isEstimate={isEstimate} />
      <div className="h-72 w-full p-5" role="presentation">
        {children}
      </div>
      {narration !== undefined && <div className="px-5 pb-4">{narration}</div>}
      <ChartDataTable
        title={title}
        data={data}
        valueLabel={valueLabel}
        secondaryLabel={secondaryLabel}
      />
    </figure>
  );
}
