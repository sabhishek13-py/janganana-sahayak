import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { use } from 'react';

import { NAV_ROUTES } from '@/components/site-header';
import { PageHeader, Section, Stat, StatBand } from '@/components/ui/page';
import { CENSUS_2027 } from '@/data/census2027';
import { Link } from '@/i18n/navigation';
import { enableStaticRendering } from '@/i18n/static-locale';

/** Each route's one-line description, keyed to its `home.nav*` message. */
const DESCRIPTION_KEYS = {
  phases: 'navPhases',
  schedule: 'navSchedule',
  walkthrough: 'navWalkthrough',
  trust: 'navTrust',
  insights: 'navInsights',
} as const;

function Home() {
  const t = useTranslations('home');
  const nav = useTranslations('nav');

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')} />

      <Section label={t('startHere')}>
        {/*
          Cards abut and are divided by rules, per the design system: a 2px grid
          with no gaps, where each cell draws its own top and left edge. The
          columns collapse on a phone, which the reference deliberately leaves
          undone — but this is a public service read mostly on one.
        */}
        <ul className="grid grid-cols-1 border-b-2 border-line-strong sm:grid-cols-2 lg:grid-cols-3">
          {NAV_ROUTES.map((route) => (
            <li
              key={route.href}
              className="border-t-2 border-line-strong lg:[&:not(:nth-child(3n+1))]:border-l-2 sm:[&:nth-child(2n)]:border-l-2 lg:[&:nth-child(2n)]:border-l-0"
            >
              <Link
                href={route.href}
                className="group flex h-full flex-col gap-3 p-5 text-ink no-underline transition-colors hover:bg-primary-100 sm:pl-6"
              >
                <span className="flex items-center gap-2.5 text-[1.03125rem] font-bold leading-[1.4] tracking-tight text-primary-700">
                  {nav(route.key)}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                  />
                </span>
                <span className="text-meta leading-[1.6] text-ink-subtle">
                  {t(DESCRIPTION_KEYS[route.key])}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section label={t('glance')}>
        <StatBand>
          <Stat
            label={t('statCensusNumber')}
            value={t('ordinal', { n: CENSUS_2027.censusNumber })}
          />
          <Stat
            label={t('statSinceIndependence')}
            value={t('ordinal', { n: CENSUS_2027.censusesSinceIndependence })}
          />
          <Stat
            label={t('statFunctionaries')}
            value={CENSUS_2027.fieldFunctionaries.label}
            accent
          />
        </StatBand>
      </Section>
    </div>
  );
}

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  enableStaticRendering(locale);
  return <Home />;
}
