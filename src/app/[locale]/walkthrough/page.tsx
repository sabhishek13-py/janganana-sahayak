import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { use } from 'react';

import { Callout } from '@/components/ui/callout';
import { PageHeader, Section } from '@/components/ui/page';
import { CENSUS_2027 } from '@/data/census2027';
import { AskAssistant } from '@/features/walkthrough/components/ask-assistant';
import { DocumentChecklist } from '@/features/walkthrough/components/document-checklist';
import { PracticeForm } from '@/features/walkthrough/components/practice-form';
import { enableStaticRendering } from '@/i18n/static-locale';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'walkthrough' });
  return { title: t('title'), description: t('lead') };
}

function WalkthroughContent() {
  const t = useTranslations('walkthrough');

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')} />

      <Callout tone="warn" title={t('wordingTitle')}>
        {t('wordingBody', { count: CENSUS_2027.houselisting.questionCount })}
      </Callout>

      <DocumentChecklist />

      <Section label={t('practiceTitle')}>
        <PracticeForm />
      </Section>

      <Section label={t('askTitle')}>
        <AskAssistant />
      </Section>
    </div>
  );
}

export default function WalkthroughPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  enableStaticRendering(locale);
  return <WalkthroughContent />;
}
