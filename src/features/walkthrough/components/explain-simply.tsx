'use client';
// Interactive: streams an explanation and appends it to a live region.

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import { useStreamedExplanation } from '../hooks/use-streamed-explanation';

export interface ExplainSimplyProps {
  readonly questionNumber: number;
}

/**
 * @requirement REQ-3 Guide users through self-enumeration
 * Gemini streams a plain-language explanation in the reader's language.
 */
export function ExplainSimply({ questionNumber }: ExplainSimplyProps) {
  const t = useTranslations('walkthrough');
  const common = useTranslations('common');
  const a11y = useTranslations('a11y');
  const { text, status, explain } = useStreamedExplanation(questionNumber);

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        onClick={() => {
          void explain();
        }}
        disabled={status === 'streaming'}
      >
        {status === 'streaming' ? t('explaining') : t('explainSimply')}
      </Button>
      {/*
        The explanation arrives a few characters at a time. A plain polite live
        region would restart the whole paragraph on every chunk — dozens of
        interruptions for one short answer. `aria-busy` is the mechanism for
        exactly this: assistive technology holds the announcement back while the
        region is filling and speaks it once, complete, when it flips to false.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-busy={status === 'streaming'}
        aria-label={a11y('liveAnswer')}
        className="min-h-[1.5rem]"
      >
        {status === 'failed' ? (
          <p className="text-danger-fg">{common('error')}</p>
        ) : (
          text !== '' && (
            <p className="whitespace-pre-line bg-surface-sunken p-3 text-ink">{text}</p>
          )
        )}
      </div>
    </div>
  );
}
