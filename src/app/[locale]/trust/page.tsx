import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { use } from 'react';

import { Callout } from '@/components/ui/callout';
import { PageHeader, Section } from '@/components/ui/page';
import { ClaimChecker } from '@/features/trust/components/claim-checker';
import { CENSUS_NEVER_ASKS, LEGAL_POINTS, VERIFICATION_STEPS } from '@/features/trust/lib/legal';
import { enableStaticRendering } from '@/i18n/static-locale';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trust' });
  return { title: t('title'), description: t('lead') };
}

function TrustContent() {
  const t = useTranslations('trust');

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')} />

      <Section label={t('lawTitle')}>
        {/* Rows divided by hairlines, with the citation set in the narrow face. */}
        <ul className="border-b border-line-row">
          {LEGAL_POINTS.map((point) => (
            <li
              key={point.id}
              className="border-t border-line-row py-5 first:border-t-0 first:pt-0"
            >
              <h3>{point.title}</h3>
              <p className="mt-2.5 max-w-[62ch] leading-[1.65] text-ink-muted">{point.body}</p>
              <p className="mt-3 font-narrow text-[0.78125rem] text-ink-faint">{point.citation}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section label={t('verifyTitle')}>
        {/* Numbered, because these are steps to take at the door, in order. */}
        <ol className="border-b border-line-row">
          {VERIFICATION_STEPS.map((step, index) => (
            <li
              key={step.id}
              className="flex gap-4 border-t border-line-row py-5 first:border-t-0 first:pt-0"
            >
              <span
                aria-hidden="true"
                className="font-narrow text-[1.0625rem] font-semibold leading-tight text-primary-600"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{step.instruction}</span>
                <span className="mt-1.5 block max-w-[62ch] text-meta leading-[1.6] text-ink-muted">
                  {step.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section label={t('scamTitle')}>
        <Callout tone="danger">
          <ul className="space-y-2">
            {CENSUS_NEVER_ASKS.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 bg-danger-fg" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Callout>
      </Section>

      <Section label={t('claimTitle')}>
        <ClaimChecker />
      </Section>
    </div>
  );
}

export default function TrustPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  enableStaticRendering(locale);
  return <TrustContent />;
}
