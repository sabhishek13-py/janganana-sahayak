'use client';
// Interactive: State/UT selection, optional geolocation, and a live countdown.

import { useTranslations } from 'next-intl';
import { useMemo, useState, type ChangeEvent } from 'react';

import { Callout } from '@/components/ui/callout';

import { useDetectedTerritory } from '../hooks/use-detected-territory';
import { resolveSchedule } from '../lib/schedule-lookup';

import { ScheduleResult } from './schedule-result';
import { TerritoryPicker } from './territory-picker';

/**
 * @requirement REQ-2 State-wise self-enumeration and survey dates
 * The manual State/UT picker is the authoritative path and always present.
 * Geolocation, when a Maps key is configured, only pre-selects it.
 */
export function ScheduleFinder() {
  const t = useTranslations('schedule');
  const [code, setCode] = useState('');
  const location = useDetectedTerritory(setCode);

  const schedule = useMemo(() => (code === '' ? undefined : resolveSchedule(code)), [code]);

  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setCode(event.target.value);
    location.forget();
  };

  return (
    <div className="space-y-6">
      <TerritoryPicker
        value={code}
        onChange={handleSelect}
        onUseLocation={() => {
          void location.detect();
        }}
        isLocating={location.state === 'locating'}
      />
      {location.state === 'unavailable' && (
        <Callout tone="warn">{t('locationUnavailable')}</Callout>
      )}
      {location.district !== undefined && (
        <p className="text-sm text-ink-muted">
          {t('detectedDistrict')}: {location.district}
        </p>
      )}
      {schedule !== undefined && <ScheduleResult schedule={schedule} />}
    </div>
  );
}
