import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from '@/features/i18n/components/language-switcher';
import { Link } from '@/i18n/navigation';

/**
 * The Latin half of the wordmark. A transliteration of the name, not a
 * translation of it, so it is the same in every language and stays out of the
 * message catalogs — the same rule the design applies to IS numbers.
 */
const WORDMARK_LATIN = 'JANGANANA SAHAYAK';

const ROUTES = [
  { href: '/phases', key: 'phases' },
  { href: '/schedule', key: 'schedule' },
  { href: '/walkthrough', key: 'walkthrough' },
  { href: '/trust', key: 'trust' },
  { href: '/insights', key: 'insights' },
] as const;

/**
 * The persistent header: sticky, 2px ink rule beneath, and view tabs divided by
 * vertical rules rather than spacing. The wordmark pairs the Devanagari name
 * with its Latin transliteration, as the design's does.
 */
export function SiteHeader() {
  const t = useTranslations('nav');
  const app = useTranslations('app');

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line-strong bg-surface">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 sm:px-7">
        <Link
          href="/"
          className="flex min-h-touch items-baseline gap-2.5 text-primary-600 no-underline"
        >
          <span className="text-base font-extrabold">{app('name')}</span>
          <span className="text-[0.75rem] font-extrabold uppercase tracking-[0.18em] text-ink">
            {WORDMARK_LATIN}
          </span>
        </Link>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>

      <nav aria-label={t('menu')} className="border-t-2 border-line-strong">
        <ul className="mx-auto flex max-w-[1360px] flex-wrap justify-center px-4 sm:px-7">
          {ROUTES.map((route) => (
            <li key={route.href} className="border-r-2 border-line-strong first:border-l-2">
              <Link
                href={route.href}
                className="inline-flex min-h-touch items-center px-4 text-[0.71875rem] font-extrabold uppercase tracking-[0.14em] text-ink-subtle no-underline transition-colors hover:bg-line-strong hover:text-white"
              >
                {t(route.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export { ROUTES as NAV_ROUTES };
