'use client';
// Interactive: copies the rebuttal text to the clipboard.

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CENSUS_2027 } from '@/data/census2027';
import type { ClaimVerdict } from '@/lib/ai/contracts';

/** A short reply a reader can forward, with the official portal appended. */
export function RebuttalCard({ verdict }: { readonly verdict: ClaimVerdict }) {
  const t = useTranslations('trust');
  const common = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const shareText = `${verdict.rebuttal}\n\n${CENSUS_2027.officialPortalUrl}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="border-2 border-primary-600 bg-primary-100 p-4">
      <figcaption className="mb-2 text-sm font-semibold text-primary-800">
        {t('rebuttalTitle')}
      </figcaption>
      <blockquote className="whitespace-pre-line text-primary-800">{shareText}</blockquote>
      <div className="mt-3 flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            void copy();
          }}
        >
          {common('copy')}
        </Button>
        <p aria-live="polite" className="text-sm text-ok-fg">
          {copied ? common('copied') : ''}
        </p>
      </div>
    </figure>
  );
}
