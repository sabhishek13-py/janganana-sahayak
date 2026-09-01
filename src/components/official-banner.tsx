import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CENSUS_2027 } from '@/data/census2027';

/**
 * Persistent, on every page: this is an unofficial tool, and real
 * self-enumeration happens only on the Government of India portal.
 *
 * Set in the inverted bar the system uses for the one statement a reader must
 * not miss — ink ground, white text, no rounding.
 */
export function OfficialBanner() {
  const t = useTranslations('app');

  return (
    <div className="bg-line-strong text-white">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-[0.78125rem] sm:px-7">
        <span className="font-extrabold uppercase tracking-[0.1em] text-primary-300">
          {t('bannerTitle')}
        </span>
        <span className="text-primary-200">{t('bannerBody')}</span>
        <a
          href={CENSUS_2027.officialPortalUrl}
          rel="noopener noreferrer external"
          target="_blank"
          className="inline-flex min-h-touch items-center gap-1.5 border-b border-primary-300 font-semibold uppercase tracking-button text-white hover:border-white"
        >
          {t('bannerCta')}
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
