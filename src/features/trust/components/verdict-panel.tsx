'use client';
// Interactive: renders the classifier's verdict and the shareable rebuttal.

import { useTranslations } from 'next-intl';

import { Callout } from '@/components/ui/callout';
import { SpeakButton } from '@/features/i18n/components/speak-button';
import type { ClaimVerdict } from '@/lib/ai/contracts';

import type { CheckStatus } from '../hooks/use-claim-verdict';

import { RebuttalCard } from './rebuttal-card';

const TONE_FOR_VERDICT = {
  TRUE: 'ok',
  FALSE: 'danger',
  MISLEADING: 'warn',
  NOT_YET_NOTIFIED: 'warn',
} as const;

export interface VerdictPanelProps {
  readonly verdict: ClaimVerdict | undefined;
  readonly status: CheckStatus;
}

export function VerdictPanel({ verdict, status }: VerdictPanelProps) {
  const t = useTranslations('trust');
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');

  return (
    <div role="status" aria-live="polite" aria-label={a11y('liveAnswer')} className="space-y-3">
      {status === 'failed' && <Callout tone="danger">{common('error')}</Callout>}
      {verdict !== undefined && (
        <>
          <Callout tone={TONE_FOR_VERDICT[verdict.verdict]} title={t(`verdict${verdict.verdict}`)}>
            <p>
              <span className="font-semibold">{t('reasonTitle')}: </span>
              {verdict.reason}
            </p>
            {verdict.groundedIn.length > 0 && (
              <p className="mt-2 text-xs">
                {common('source')}: {verdict.groundedIn.join('; ')}
              </p>
            )}
            <div className="mt-2">
              <SpeakButton text={verdict.reason} label={common('readAloud')} />
            </div>
          </Callout>
          <RebuttalCard verdict={verdict} />
        </>
      )}
    </div>
  );
}
