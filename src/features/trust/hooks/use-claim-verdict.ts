'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import { claimVerdictSchema, type ClaimVerdict } from '@/lib/ai/contracts';
import { postJson } from '@/lib/api/post-json';

export type CheckStatus = 'idle' | 'checking' | 'failed';

export interface ClaimCheck {
  readonly verdict: ClaimVerdict | undefined;
  readonly status: CheckStatus;
  readonly check: (claim: string) => Promise<void>;
}

/** Sends a pasted message to the classifier and keeps the validated verdict. */
export function useClaimVerdict(): ClaimCheck {
  const locale = useLocale();
  const [verdict, setVerdict] = useState<ClaimVerdict>();
  const [status, setStatus] = useState<CheckStatus>('idle');

  async function check(claim: string): Promise<void> {
    setStatus('checking');
    setVerdict(undefined);
    try {
      setVerdict(await postJson('/api/claim-check', { claim, locale }, claimVerdictSchema));
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  }

  return { verdict, status, check };
}
