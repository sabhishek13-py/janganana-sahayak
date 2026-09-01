'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import { insightAnswerSchema, type InsightAnswer } from '@/lib/ai/contracts';
import { postJson } from '@/lib/api/post-json';

export type QueryStatus = 'idle' | 'asking' | 'failed';

export interface InsightQueryState {
  readonly answer: InsightAnswer | undefined;
  readonly status: QueryStatus;
  readonly ask: (question: string) => Promise<void>;
}

/** Asks a grounded question about the Census 2011 baselines. */
export function useInsightAnswer(): InsightQueryState {
  const locale = useLocale();
  const [answer, setAnswer] = useState<InsightAnswer>();
  const [status, setStatus] = useState<QueryStatus>('idle');

  async function ask(question: string): Promise<void> {
    setStatus('asking');
    setAnswer(undefined);
    try {
      setAnswer(await postJson('/api/insights-query', { question, locale }, insightAnswerSchema));
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  }

  return { answer, status, ask };
}
