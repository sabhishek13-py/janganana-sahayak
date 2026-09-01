'use client';
// Interactive: one practice question, its help text, and its explainer.

import { useTranslations } from 'next-intl';

import type { HloQuestion } from '@/data/schema';

import { AnswerField } from './answer-field';
import { ExplainSimply } from './explain-simply';

export interface QuestionCardProps {
  readonly question: HloQuestion;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const t = useTranslations('walkthrough');
  const promptId = `q-${String(question.number)}-label`;
  const promptText = `${t('question')} ${String(question.number)}. ${question.prompt}`;

  return (
    <li className="border-2 border-line-strong bg-surface p-4">
      {/*
        A multi-choice answer is a group of checkboxes, and a group is labelled by
        its own <legend>, not by a <label for>: pointing `htmlFor` at a fieldset
        would leave the association dangling.
      */}
      {question.kind === 'MULTI_CHOICE' ? (
        <p id={promptId} className="block font-medium">
          {promptText}
        </p>
      ) : (
        <label htmlFor={`q-${String(question.number)}`} className="block font-medium">
          {promptText}
        </label>
      )}
      <p className="mb-3 mt-1 text-sm text-ink-muted">
        {t('help')}: {question.help}
      </p>
      <AnswerField question={question} value={value} onChange={onChange} />
      <div className="mt-3">
        <ExplainSimply questionNumber={question.number} />
      </div>
    </li>
  );
}
