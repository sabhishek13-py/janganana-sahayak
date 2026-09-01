import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { use } from 'react';

import { PageHeader, Section } from '@/components/ui/page';
import { ScheduleFinder } from '@/features/schedule/components/schedule-finder';
import { TerritoryTable } from '@/features/schedule/components/territory-table';
import { enableStaticRendering } from '@/i18n/static-locale';

/** The cartogram is below the fold and purely visual, so it is code-split out. */
const StatusCartogram = dynamic(
  async () => (await import('@/features/schedule/components/status-cartogram')).StatusCartogram,
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'schedule' });
  return { title: t('title'), description: t('lead') };
}

function ScheduleContent() {
  const t = useTranslations('schedule');

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')} />

      <Section label={t('finderTitle')}>
        <ScheduleFinder />
      </Section>

      <Section label={t('mapTitle')}>
        <StatusCartogram />
      </Section>

      <Section label={t('tableTitle')} aside={t('tableCaption')}>
        <TerritoryTable />
      </Section>
    </div>
  );
}

export default function SchedulePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  enableStaticRendering(locale);
  return <ScheduleContent />;
}
