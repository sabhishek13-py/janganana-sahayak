'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import { askAnswerSchema, type AskAnswer } from '@/lib/ai/contracts';
import { postJson } from '@/lib/api/post-json';

export type AskStatus = 'idle' | 'asking' | 'failed';

export interface GroundedAnswer {
  readonly answer: AskAnswer | undefined;
  readonly status: AskStatus;
  readonly ask: (question: string) => Promise<void>;
}

/** Posts a question to the grounded assistant and keeps the validated answer. */
export function useGroundedAnswer(): GroundedAnswer {
  const locale = useLocale();
  const [answer, setAnswer] = useState<AskAnswer>();
  const [status, setStatus] = useState<AskStatus>('idle');

  async function ask(question: string): Promise<void> {
    setStatus('asking');
    setAnswer(undefined);
    try {
      setAnswer(await postJson('/api/ask', { question, locale }, askAnswerSchema));
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  }

  return { answer, status, ask };
}
