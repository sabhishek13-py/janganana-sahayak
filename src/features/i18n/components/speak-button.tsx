'use client';
// Interactive: reads text aloud through the browser's speech synthesis.

import { Volume2, VolumeX } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/routing';

import { isSpeechSynthesisAvailable, speak, stopSpeaking } from '../lib/speech';

export interface SpeakButtonProps {
  readonly text: string;
  readonly label: string;
}

/** @requirement REQ-6 Multiple Indian languages */
export function SpeakButton({ text, label }: SpeakButtonProps) {
  const locale = useLocale() as Locale;
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setAvailable(isSpeechSynthesisAvailable());
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!available || text === '') return null;

  function toggle() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speak(text, locale);
    setSpeaking(true);
  }

  return (
    <Button variant="secondary" onClick={toggle} aria-pressed={speaking}>
      {speaking ? (
        <VolumeX aria-hidden="true" className="h-4 w-4" />
      ) : (
        <Volume2 aria-hidden="true" className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
