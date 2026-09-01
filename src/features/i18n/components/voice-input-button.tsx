'use client';
// Interactive: captures Indic speech and writes the transcript into a field.

import { Mic, MicOff } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/routing';

import { isVoiceInputAvailable, startVoiceInput, type VoiceSession } from '../lib/speech';

export interface VoiceInputButtonProps {
  readonly onTranscript: (transcript: string) => void;
  readonly label: string;
}

/** @requirement REQ-6 Multiple Indian languages */
export function VoiceInputButton({ onTranscript, label }: VoiceInputButtonProps) {
  const locale = useLocale() as Locale;
  const [available, setAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const session = useRef<VoiceSession | undefined>(undefined);

  useEffect(() => {
    setAvailable(isVoiceInputAvailable());
    return () => {
      session.current?.stop();
    };
  }, []);

  if (!available) return null;

  function toggle() {
    if (listening) {
      session.current?.stop();
      setListening(false);
      return;
    }
    session.current = startVoiceInput(locale, onTranscript, () => {
      setListening(false);
    });
    setListening(session.current !== undefined);
  }

  return (
    <Button variant="secondary" onClick={toggle} aria-pressed={listening}>
      {listening ? (
        <MicOff aria-hidden="true" className="h-4 w-4" />
      ) : (
        <Mic aria-hidden="true" className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
