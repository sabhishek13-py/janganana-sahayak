'use client';
// Interactive: formats census dates through the reader's locale.

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { SubArea } from '@/data/census2027';

import type { PopulationEnumerationPlan, ResolvedSchedule } from '../lib/schedule-lookup';
import { useFormattedWindow } from '../lib/use-formatted-window';

/** Message keys for the snow-bound split; 'ALL' needs no qualifier at all. */
const AREA_LABEL_KEYS = {
  SNOW_BOUND_AREAS: 'areaSnowBound',
  REST_OF_TERRITORY: 'areaRest',
} as const;

function Row({ term, children }: { readonly term: string; readonly children: ReactNode }) {
  return (
    <div className="border-b border-line-row py-3 last:border-b-0">
      <dt className="text-sm text-ink-subtle">{term}</dt>
      <dd className="mt-1 font-medium text-ink">{children}</dd>
    </div>
  );
}

function PhaseTwoPlans({
  plans,
  referenceDateLabel,
}: {
  readonly plans: readonly PopulationEnumerationPlan[];
  readonly referenceDateLabel: string;
}) {
  const t = useTranslations('schedule');
  const { date, month } = useFormattedWindow();

  return (
    <ul className="space-y-1">
      {plans.map((plan) => (
        <li key={plan.area}>
          {plan.area !== 'ALL' && (
            <span className="text-sm text-ink-subtle">{t(AREA_LABEL_KEYS[plan.area])}: </span>
          )}
          {month(plan.month)}
          <span className="text-sm text-ink-subtle">
            {' '}
            ({referenceDateLabel} {date(plan.referenceDate)})
          </span>
        </li>
      ))}
    </ul>
  );
}

function SubAreaList({ areas }: { readonly areas: readonly SubArea[] }) {
  const { window } = useFormattedWindow();
  return (
    <ul className="space-y-1">
      {areas.map((area) => (
        <li key={area.name}>
          {area.name}: {window(area.selfEnumeration)}
        </li>
      ))}
    </ul>
  );
}

/** Renders the resolved windows for one State/UT, including the snow-bound split. */
export function WindowSummary({ schedule }: { readonly schedule: ResolvedSchedule }) {
  const t = useTranslations('schedule');
  const common = useTranslations('common');
  const { window } = useFormattedWindow();
  const awaiting = <span className="text-ink-muted">{common('notNotified')}</span>;
  const { selfEnumeration, houselisting, subAreas } = schedule;

  return (
    <dl className="border-2 border-line-strong bg-surface px-4">
      <Row term={t('selfWindow')}>
        {selfEnumeration === null ? awaiting : window(selfEnumeration)}
      </Row>
      <Row term={t('hloWindow')}>{houselisting === null ? awaiting : window(houselisting)}</Row>
      <Row term={t('peMonth')}>
        <PhaseTwoPlans
          plans={schedule.populationEnumeration}
          referenceDateLabel={t('referenceDate')}
        />
      </Row>
      {schedule.territory.phaseTwoTrack !== 'NATIONAL' && (
        <Row term={t('whyDatesDiffer')}>{t('snowBoundNote')}</Row>
      )}
      {subAreas.length > 0 && (
        <Row term={t('subAreasNotified')}>
          <SubAreaList areas={subAreas} />
        </Row>
      )}
    </dl>
  );
}
