'use client';
// Interactive: the manual State/UT picker, plus the optional location shortcut.

import { useTranslations } from 'next-intl';
import type { ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { FieldLabel, Select } from '@/components/ui/field';

import { ALL_SCHEDULES } from '../lib/schedule-lookup';

export interface TerritoryPickerProps {
  readonly value: string;
  readonly onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly onUseLocation: () => void;
  readonly isLocating: boolean;
}

export function TerritoryPicker({
  value,
  onChange,
  onUseLocation,
  isLocating,
}: TerritoryPickerProps) {
  const t = useTranslations('schedule');
  const common = useTranslations('common');

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-[16rem] flex-1">
        <FieldLabel htmlFor="territory">{t('pickState')}</FieldLabel>
        <Select id="territory" name="territory" value={value} onChange={onChange}>
          <option value="">{common('selectOption')}</option>
          {ALL_SCHEDULES.map((entry) => (
            <option key={entry.territory.code} value={entry.territory.code}>
              {entry.territory.name}
            </option>
          ))}
        </Select>
      </div>
      <Button variant="secondary" onClick={onUseLocation} disabled={isLocating}>
        {isLocating ? t('locating') : t('useLocation')}
      </Button>
    </div>
  );
}
