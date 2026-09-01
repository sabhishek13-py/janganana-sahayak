'use client';
// Interactive: memoised so filtering re-renders only the rows that changed.

import { memo } from 'react';

import { StatusChip } from '@/components/ui/callout';

import type { ResolvedSchedule } from '../lib/schedule-lookup';
import { useFormattedWindow } from '../lib/use-formatted-window';

export interface TerritoryRowProps {
  readonly schedule: ResolvedSchedule;
  readonly notNotified: string;
  readonly notified: string;
  readonly awaiting: string;
}

export const TerritoryRow = memo(function TerritoryRow({
  schedule,
  notNotified,
  notified,
  awaiting,
}: TerritoryRowProps) {
  const { month, windowOr } = useFormattedWindow();
  const isNotified = schedule.status === 'NOTIFIED';

  return (
    <tr className="border-b border-line-row last:border-b-0 hover:bg-primary-100">
      <th scope="row" className="py-3 pr-4 text-left font-semibold">
        {schedule.territory.name}
      </th>
      <td className="py-3 pr-4">
        <StatusChip tone={isNotified ? 'ok' : 'warn'}>
          {isNotified ? notified : awaiting}
        </StatusChip>
      </td>
      <td className="py-3 pr-4 font-narrow text-[0.8125rem] text-ink-muted">
        {windowOr(schedule.selfEnumeration, notNotified)}
      </td>
      <td className="py-3 pr-4 font-narrow text-[0.8125rem] text-ink-muted">
        {windowOr(schedule.houselisting, notNotified)}
      </td>
      <td className="py-3 font-narrow text-[0.8125rem] text-ink-muted">
        {schedule.populationEnumeration.map((plan) => month(plan.month)).join(' / ')}
      </td>
    </tr>
  );
});
