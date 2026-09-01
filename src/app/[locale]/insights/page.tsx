import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { use } from 'react';

import { PageHeader, Section } from '@/components/ui/page';
import { InsightCharts } from '@/features/insights/components/insight-charts';
import { InsightQuery } from '@/features/insights/components/insight-query';
import { enableStaticRendering } from '@/i18n/static-locale';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'insights' });
  return { title: t('title'), description: t('lead') };
}

function InsightsContent() {
  const t = useTranslations('insights');

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')} />

      <Section label={t('askTitle')}>
        <InsightQuery />
      </Section>

      <Section label={t('chartsTitle')} aside={t('baselineNote')}>
        <InsightCharts />
      </Section>
    </div>
  );
}

export default function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  enableStaticRendering(locale);
  return <InsightsContent />;
}
