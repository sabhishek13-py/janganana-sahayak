import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { use } from 'react';

import { PageHeader, Section } from '@/components/ui/page';
import { PersonaSwitch } from '@/features/phases/components/persona-switch';
import { PhaseComparison } from '@/features/phases/components/phase-comparison';
import { enableStaticRendering } from '@/i18n/static-locale';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'phases' });
  return { title: t('title'), description: t('lead') };
}

function PhasesContent() {
  const t = useTranslations('phases');
  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')} />
      <Section label={t('collects')}>
        <PhaseComparison />
      </Section>
      <Section label={t('whatChanges')}>
        <PersonaSwitch />
      </Section>
    </div>
  );
}

export default function PhasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  enableStaticRendering(locale);
  return <PhasesContent />;
}
