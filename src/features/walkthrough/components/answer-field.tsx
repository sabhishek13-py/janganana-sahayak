'use client';
// Interactive: the single input for one practice question.

import { useTranslations } from 'next-intl';

import type { HloQuestion } from '@/data/schema';

const FIELD_CLASS =
  'min-h-touch w-full max-w-md border-2 border-line bg-surface px-3 py-2 text-base';

export interface AnswerFieldProps {
  readonly question: HloQuestion;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

function ChoiceField({ question, value, onChange }: AnswerFieldProps) {
  const t = useTranslations('common');
  return (
    <select
      id={`q-${String(question.number)}`}
      name={`q-${String(question.number)}`}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      className={FIELD_CLASS}
    >
      <option value="">{t('selectOption')}</option>
      {question.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/** Answers are held as one string, so a multi-choice answer is a joined list. */
const MULTI_SEPARATOR = ', ';

function MultiChoiceField({ question, value, onChange }: AnswerFieldProps) {
  const selected = value === '' ? [] : value.split(MULTI_SEPARATOR);
  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...question.options].filter((item) => selected.includes(item) || item === option);
    onChange(next.join(MULTI_SEPARATOR));
  };

  return (
    <fieldset className="space-y-2" aria-labelledby={`q-${String(question.number)}-label`}>
      <legend className="sr-only">{question.prompt}</legend>
      {question.options.map((option) => (
        <label key={option} className="flex min-h-touch items-center gap-2">
          <input
            type="checkbox"
            name={`q-${String(question.number)}`}
            value={option}
            checked={selected.includes(option)}
            onChange={() => {
              toggle(option);
            }}
            className="h-5 w-5 border-line"
          />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function AnswerField(props: AnswerFieldProps) {
  const { question, value, onChange } = props;
  if (question.kind === 'MULTI_CHOICE') return <MultiChoiceField {...props} />;
  if (question.kind === 'SINGLE_CHOICE') return <ChoiceField {...props} />;
  return (
    <input
      id={`q-${String(question.number)}`}
      name={`q-${String(question.number)}`}
      type={question.kind === 'NUMBER' ? 'number' : 'text'}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      className={FIELD_CLASS}
    />
  );
}
