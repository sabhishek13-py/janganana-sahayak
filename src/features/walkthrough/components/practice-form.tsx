'use client';
// Interactive: holds practice answers in memory and clears them on request.

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { PHASE_1_QUESTIONS } from '@/data/phase1-questions';

import { usePracticeAnswers } from '../hooks/use-practice-answers';

import { QuestionCard } from './question-card';

function ClearAnswers({
  onClear,
  cleared,
}: {
  readonly onClear: () => void;
  readonly cleared: boolean;
}) {
  const t = useTranslations('walkthrough');
  return (
    <div className="space-y-2">
      <Button variant="secondary" onClick={onClear}>
        {t('clearAnswers')}
      </Button>
      <p aria-live="polite" className="text-sm text-ok-fg">
        {cleared ? t('answersCleared') : ''}
      </p>
    </div>
  );
}

/** @requirement REQ-3 Guide users through self-enumeration */
export function PracticeForm() {
  const t = useTranslations('walkthrough');
  const { answers, setAnswer, clear, answeredCount } = usePracticeAnswers();
  const [cleared, setCleared] = useState(false);

  return (
    <div className="space-y-6">
      <Callout tone="ok" title={t('practiceNotice')}>
        {t('lead')}
      </Callout>

      <p aria-live="polite" className="text-sm text-ink-muted">
        {t('progress')}: {answeredCount} / {PHASE_1_QUESTIONS.length}
      </p>

      <ol className="space-y-6">
        {PHASE_1_QUESTIONS.map((question) => (
          <QuestionCard
            key={question.number}
            question={question}
            value={answers.get(question.number) ?? ''}
            onChange={(value) => {
              setAnswer(question.number, value);
              setCleared(false);
            }}
          />
        ))}
      </ol>

      <ClearAnswers
        cleared={cleared}
        onClear={() => {
          clear();
          setCleared(true);
        }}
      />
    </div>
  );
}
