'use client';
// Interactive: search over the national table, deferred so typing stays smooth.

import { useTranslations } from 'next-intl';
import { memo, useDeferredValue, useMemo, useState } from 'react';

import { FieldLabel, TextInput } from '@/components/ui/field';

import { searchTerritories, ALL_SCHEDULES, type ResolvedSchedule } from '../lib/schedule-lookup';

import { TerritoryRow } from './territory-row';

function SearchField({
  query,
  onChange,
}: {
  readonly query: string;
  readonly onChange: (value: string) => void;
}) {
  const t = useTranslations('schedule');
  const common = useTranslations('common');
  return (
    <div className="max-w-md">
      <FieldLabel htmlFor="territory-search">{common('search')}</FieldLabel>
      <TextInput
        id="territory-search"
        name="territory-search"
        type="search"
        value={query}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={t('searchPlaceholder')}
      />
    </div>
  );
}

const TableHead = memo(function TableHead() {
  const t = useTranslations('schedule');
  return (
    <thead>
      <tr className="border-b-2 border-line-strong [&>th]:py-2.5 [&>th]:pr-4 [&>th]:align-bottom [&>th]:text-[0.6875rem] [&>th]:font-extrabold [&>th]:uppercase [&>th]:tracking-[0.14em] [&>th]:text-ink-faint">
        <th scope="col">{t('colTerritory')}</th>
        <th scope="col">{t('colStatus')}</th>
        <th scope="col">{t('colSelf')}</th>
        <th scope="col">{t('colHlo')}</th>
        <th scope="col" className="!pr-0">
          {t('colPe')}
        </th>
      </tr>
    </thead>
  );
});

function TerritoryRows({ rows }: { readonly rows: readonly ResolvedSchedule[] }) {
  const t = useTranslations('schedule');
  const common = useTranslations('common');
  return (
    <tbody>
      {rows.map((schedule) => (
        <TerritoryRow
          key={schedule.territory.code}
          schedule={schedule}
          notNotified={common('notNotified')}
          notified={t('notified')}
          awaiting={t('awaiting')}
        />
      ))}
    </tbody>
  );
}

/**
 * @requirement REQ-2 State-wise self-enumeration and survey dates
 * The searchable national table. It is also the accessible text equivalent of
 * the status cartogram shown above it.
 */
export function TerritoryTable() {
  const t = useTranslations('schedule');
  const common = useTranslations('common');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const rows = useMemo(() => searchTerritories(deferredQuery), [deferredQuery]);

  return (
    <div className="space-y-4">
      <SearchField query={query} onChange={setQuery} />
      <p aria-live="polite" className="font-narrow text-[0.78125rem] text-ink-faint">
        {rows.length} {common('of')} {ALL_SCHEDULES.length}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <caption className="sr-only">{t('tableCaption')}</caption>
          <TableHead />
          <TerritoryRows rows={rows} />
        </table>
      </div>
    </div>
  );
}
