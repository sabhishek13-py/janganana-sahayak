'use client';
// Interactive: the disclosure that reveals the numbers behind a chart.

import { useTranslations } from 'next-intl';

import type { ChartDatum } from '../lib/chart-data';

function TableRows({
  data,
  hasSecondary,
}: {
  readonly data: readonly ChartDatum[];
  readonly hasSecondary: boolean;
}) {
  return (
    <tbody>
      {data.map((datum) => (
        <tr key={datum.code} className="border-b border-line-row last:border-b-0">
          <th scope="row" className="py-1.5 pr-4 text-left font-normal">
            {datum.name}
          </th>
          <td className="py-1.5 pr-4 font-narrow tabular-nums">{datum.value}</td>
          {hasSecondary && (
            <td className="py-1.5 font-narrow tabular-nums">{datum.secondary ?? '-'}</td>
          )}
        </tr>
      ))}
    </tbody>
  );
}

export interface ChartDataTableProps {
  readonly title: string;
  readonly data: readonly ChartDatum[];
  readonly valueLabel: string;
  readonly secondaryLabel?: string;
}

/** The accessible text equivalent that every chart on this page ships with. */
export function ChartDataTable({ title, data, valueLabel, secondaryLabel }: ChartDataTableProps) {
  const t = useTranslations('insights');
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');

  return (
    <details className="mt-auto border-t-2 border-line-strong">
      <summary className="flex min-h-touch cursor-pointer items-center px-5 text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-primary-700 hover:bg-primary-100">
        {common('showTable')}
      </summary>
      <div className="overflow-x-auto px-5 pb-4">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            {a11y('chartTable')}: {title}
          </caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4">
                {t('tableRowHeader')}
              </th>
              <th scope="col" className="py-2 pr-4">
                {valueLabel}
              </th>
              {secondaryLabel !== undefined && (
                <th scope="col" className="py-2">
                  {secondaryLabel}
                </th>
              )}
            </tr>
          </thead>
          <TableRows data={data} hasSecondary={secondaryLabel !== undefined} />
        </table>
      </div>
    </details>
  );
}
