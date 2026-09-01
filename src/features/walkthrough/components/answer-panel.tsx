'use client';
// Interactive: renders whatever the assistant last returned, in a live region.

import { useTranslations } from 'next-intl';

import { Callout } from '@/components/ui/callout';
import { SpeakButton } from '@/features/i18n/components/speak-button';
import type { AskAnswer } from '@/lib/ai/contracts';

import type { AskStatus } from '../hooks/use-grounded-answer';

export interface AnswerPanelProps {
  readonly answer: AskAnswer | undefined;
  readonly status: AskStatus;
}

export function AnswerPanel({ answer, status }: AnswerPanelProps) {
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');

  return (
    <div role="status" aria-live="polite" aria-label={a11y('liveAnswer')} className="space-y-2">
      {status === 'failed' && <Callout tone="danger">{common('error')}</Callout>}
      {answer !== undefined && (
        <Callout tone={answer.notYetNotified ? 'warn' : 'info'}>
          <p>{answer.answer}</p>
          {answer.groundedIn.length > 0 && (
            <p className="mt-2 text-xs">
              {common('source')}: {answer.groundedIn.join('; ')}
            </p>
          )}
          <div className="mt-2">
            <SpeakButton text={answer.answer} label={common('readAloud')} />
          </div>
        </Callout>
      )}
    </div>
  );
}
