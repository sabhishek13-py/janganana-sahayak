'use client';
// Interactive: posts a question to the grounded assistant and shows the answer.

import { useTranslations } from 'next-intl';
import { useState, type SyntheticEvent } from 'react';

import { Button } from '@/components/ui/button';
import { FieldLabel, TextArea } from '@/components/ui/field';
import { VoiceInputButton } from '@/features/i18n/components/voice-input-button';

import { useGroundedAnswer } from '../hooks/use-grounded-answer';

import { AnswerPanel } from './answer-panel';

/**
 * @requirement REQ-3 Guide users through self-enumeration
 * Answers come only from the frozen dataset. When the dataset does not settle a
 * question the assistant says it is not yet notified rather than guessing.
 */
export function AskAssistant() {
  const t = useTranslations('walkthrough');
  const common = useTranslations('common');
  const [question, setQuestion] = useState('');
  const { answer, status, ask } = useGroundedAnswer();

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (question.trim().length >= 3) void ask(question);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <FieldLabel htmlFor="ask-question">{t('askTitle')}</FieldLabel>
        <TextArea
          id="ask-question"
          name="ask-question"
          rows={3}
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);
          }}
          placeholder={t('askPlaceholder')}
          maxLength={500}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={status === 'asking'}>
          {status === 'asking' ? common('loading') : t('askSubmit')}
        </Button>
        <VoiceInputButton label={common('voiceInput')} onTranscript={setQuestion} />
      </div>
      <AnswerPanel answer={answer} status={status} />
    </form>
  );
}
