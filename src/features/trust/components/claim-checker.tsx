'use client';
// Interactive: posts a pasted message to the classifier and renders the verdict.

import { useTranslations } from 'next-intl';
import { useState, type SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { FieldLabel, TextArea } from '@/components/ui/field';
import { VoiceInputButton } from '@/features/i18n/components/voice-input-button';

import { useClaimVerdict } from '../hooks/use-claim-verdict';

import { VerdictPanel } from './verdict-panel';

/** @requirement REQ-4 Data privacy and misinformation */
export function ClaimChecker() {
  const t = useTranslations('trust');
  const common = useTranslations('common');
  const [claim, setClaim] = useState('');
  const { verdict, status, check } = useClaimVerdict();

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (claim.trim().length >= 5) void check(claim);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="claim">{t('claimTitle')}</FieldLabel>
          <TextArea
            id="claim"
            name="claim"
            rows={4}
            value={claim}
            onChange={(event) => {
              setClaim(event.target.value);
            }}
            placeholder={t('claimPlaceholder')}
            maxLength={1500}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={status === 'checking'}>
            {status === 'checking' ? t('checking') : t('claimSubmit')}
          </Button>
          <VoiceInputButton label={common('voiceInput')} onTranscript={setClaim} />
        </div>
      </form>
      <VerdictPanel verdict={verdict} status={status} />
    </div>
  );
}
