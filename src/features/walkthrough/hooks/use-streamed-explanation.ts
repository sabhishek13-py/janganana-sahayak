'use client';

import { useLocale } from 'next-intl';
import { useCallback, useState } from 'react';

import { appCheckHeaders } from '@/lib/firebase';
import { sanitizeModelText } from '@/lib/sanitize';

export type ExplainStatus = 'idle' | 'streaming' | 'failed';

export interface StreamedExplanation {
  readonly text: string;
  readonly status: ExplainStatus;
  readonly explain: () => Promise<void>;
}

/**
 * Streams a plain-language explanation for one houselisting question. Only the
 * question number is sent, so no visitor text ever reaches the model.
 */
export function useStreamedExplanation(questionNumber: number): StreamedExplanation {
  const locale = useLocale();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<ExplainStatus>('idle');

  const explain = useCallback(async () => {
    setStatus('streaming');
    setText('');
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(await appCheckHeaders()) },
        body: JSON.stringify({ questionNumber, locale }),
      });
      const body = response.body;
      if (!response.ok || body === null) throw new Error(`Explain failed: ${response.status}`);

      const reader = body.pipeThrough(new TextDecoderStream()).getReader();
      let accumulated = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += value;
        setText(sanitizeModelText(accumulated));
      }
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  }, [questionNumber, locale]);

  return { text, status, explain };
}
