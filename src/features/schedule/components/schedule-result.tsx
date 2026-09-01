'use client';
// Interactive: shows the resolved windows and a live countdown for one territory.

import { useTranslations } from 'next-intl';

import { Callout } from '@/components/ui/callout';

import type { ResolvedSchedule } from '../lib/schedule-lookup';

import { CountdownTimer } from './countdown-timer';
import { IcsDownload } from './ics-download';
import { WindowSummary } from './window-summary';

export function ScheduleResult({ schedule }: { readonly schedule: ResolvedSchedule }) {
  const t = useTranslations('schedule');
  const common = useTranslations('common');

  return (
    <section aria-live="polite" className="space-y-4">
      <h3>{schedule.territory.name}</h3>
      {schedule.selfEnumeration !== null && <CountdownTimer window={schedule.selfEnumeration} />}
      {schedule.status === 'AWAITING_STATE_NOTIFICATION' && (
        <Callout tone="warn" title={t('awaiting')}>
          {common('notNotified')}. {t('awaitingDetail')}
        </Callout>
      )}
      <WindowSummary schedule={schedule} />
      {schedule.houselisting !== null && <IcsDownload code={schedule.territory.code} />}
    </section>
  );
}
