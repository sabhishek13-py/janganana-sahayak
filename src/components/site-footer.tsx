import { useTranslations } from 'next-intl';

import { CENSUS_2027 } from '@/data/census2027';

/** The credits strip: small, wide-tracked, uppercase, divided by hairline slashes. */
export function SiteFooter() {
  const t = useTranslations('app');

  return (
    <footer className="mt-16 border-t-2 border-line-strong">
      <div className="mx-auto max-w-[1360px] space-y-3 px-4 py-6 sm:px-7">
        <p className="max-w-[62ch] text-meta leading-[1.65] text-ink-muted">{t('noDataNotice')}</p>
        <p className="max-w-[62ch] text-meta leading-[1.65] text-ink-muted">{t('footerNote')}</p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.71875rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          <span>{t('gazetteLine', { date: CENSUS_2027.gazetteNotificationDate })}</span>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <span>
            {t('outlayLine', { amount: CENSUS_2027.outlayCroreInr.toLocaleString('en-IN') })}
          </span>
        </p>
      </div>
    </footer>
  );
}
