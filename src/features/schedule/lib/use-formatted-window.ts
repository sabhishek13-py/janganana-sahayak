'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { DateWindow, IsoDate } from '@/data/census2027';
import { LOCALE_BCP47, type Locale } from '@/i18n/routing';

/**
 * Renders census dates the way a reader expects them.
 *
 * The dataset stores ISO dates because they sort and compare correctly, but
 * `2026-04-01` is a storage format, not something to show a first-time reader in
 * Assamese.
 *
 * Formatting goes through `LOCALE_BCP47` rather than the bare routing locale, so
 * English readers get the Indian convention — "1 April 2026", not the American
 * "April 1, 2026" that a plain `en` would produce.
 *
 * The instant is built at UTC midnight and formatted in UTC. That is not a
 * timezone claim: it is how a date-only value is kept from drifting a day
 * backwards for a viewer whose device clock sits behind UTC.
 */
export function useFormattedWindow() {
  const locale = useLocale() as Locale;
  const t = useTranslations('schedule');
  const tag = LOCALE_BCP47[locale];

  const date = (iso: IsoDate): string =>
    new Intl.DateTimeFormat(tag, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${iso}T00:00:00Z`));

  /** `YYYY-MM` as a localised month and year, e.g. "February 2027". */
  const month = (isoMonth: string): string =>
    new Intl.DateTimeFormat(tag, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${isoMonth}-01T00:00:00Z`));

  const window = (value: DateWindow): string =>
    t('dateRange', { start: date(value.start), end: date(value.end) });

  const windowOr = (value: DateWindow | null, fallback: string): string =>
    value === null ? fallback : window(value);

  return { date, month, window, windowOr };
}
