'use client';
// Interactive: writes the visitor's analytics choice and hides itself.

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { publicEnv } from '@/lib/public-env';

import { CONSENT_KEY, writeConsent } from './analytics';

/** The two choices, given equal weight: declining must be as easy as accepting. */
function ConsentActions({ onChoose }: { readonly onChoose: (v: 'granted' | 'denied') => void }) {
  const t = useTranslations('consent');
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          onChoose('denied');
        }}
      >
        {t('decline')}
      </Button>
      <Button
        onClick={() => {
          onChoose('granted');
        }}
      >
        {t('accept')}
      </Button>
    </>
  );
}

/** Analytics is off until this is answered. Declining is a single click, like accepting. */
export function ConsentBar() {
  const t = useTranslations('consent');
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    try {
      setDecided(globalThis.localStorage.getItem(CONSENT_KEY) !== null);
    } catch {
      setDecided(true);
    }
  }, []);

  if (publicEnv.gaMeasurementId === undefined || decided) return null;

  function choose(value: 'granted' | 'denied') {
    writeConsent(value);
    setDecided(true);
  }

  return (
    <div
      role="region"
      aria-label={t('regionLabel')}
      className="border-t border-line-row bg-surface px-4 py-3 text-sm"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <p className="flex-1">{t('question')}</p>
        <ConsentActions onChoose={choose} />
      </div>
    </div>
  );
}
