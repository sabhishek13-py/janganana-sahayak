'use client';
// Interactive: asks a grounded question about the baseline data.

import { useTranslations } from 'next-intl';
import { useState, type SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { FieldLabel, TextInput } from '@/components/ui/field';

import { useInsightAnswer } from '../hooks/use-insight-answer';

import { InsightAnswerPanel } from './insight-answer-panel';

/** @requirement REQ-5 Visualise census data meaningfully */
export function InsightQuery() {
  const t = useTranslations('insights');
  const common = useTranslations('common');
  const [question, setQuestion] = useState('');
  const { answer, status, ask } = useInsightAnswer();

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (question.trim().length >= 3) void ask(question);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <FieldLabel htmlFor="insight-question">{t('queryTitle')}</FieldLabel>
        <TextInput
          id="insight-question"
          name="insight-question"
          type="text"
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);
          }}
          placeholder={t('queryPlaceholder')}
          maxLength={400}
        />
      </div>
      <Button type="submit" disabled={status === 'asking'}>
        {status === 'asking' ? common('loading') : t('querySubmit')}
      </Button>
      <InsightAnswerPanel answer={answer} status={status} />
    </form>
  );
}
